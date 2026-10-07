// SteamLite Updater - a small stand-alone updater with its own window.
// Plain C# 5 / .NET Framework 4.x WinForms on purpose: the .NET Framework ships with Windows 10/11,
// so this builds to a ~50 KB exe that needs nothing installed.
//
// Command line (all optional):
//   --current 8.4.0   installed version (otherwise read from the Add/Remove Programs registry entry)
//   --channel beta    read version-beta.json (betas are pre-releases in the same repo) instead of version.json
using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.IO;
using System.Net;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Web.Script.Serialization;
using System.Windows.Forms;
using Microsoft.Win32;

[assembly: AssemblyTitle("SteamLite Updater")]
[assembly: AssemblyProduct("SteamLite")]
[assembly: AssemblyVersion("1.0.0.0")]

namespace SteamLiteUpdater
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            Dictionary<string, string> a = ParseArgs(args);
            // The updater lives in its own folder (%LOCALAPPDATA%\SteamLite Updater), outside the SteamLite
            // install folder, so the SteamLite installer never has to replace a running updater.

            // .NET Framework 4.x doesn't offer TLS 1.2 by default; GitHub requires it (3072 = Tls12, 768 = Tls11)
            ServicePointManager.SecurityProtocol = (SecurityProtocolType)(3072 | 768 | 192);

            try { string old = Application.ExecutablePath + ".old"; if (File.Exists(old)) File.Delete(old); } catch { } // left behind by the installer when it replaced a running updater
            bool created;
            using (Mutex m = new Mutex(true, "SteamLiteUpdater_SingleInstance", out created))
            {
                if (!created) return;
                Application.SetUnhandledExceptionMode(UnhandledExceptionMode.CatchException);
                Application.ThreadException += delegate(object s, ThreadExceptionEventArgs e) { Log("UI error: " + e.Exception); };
                AppDomain.CurrentDomain.UnhandledException += delegate(object s, UnhandledExceptionEventArgs e) { Log("Fatal: " + e.ExceptionObject); };
                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);
                Application.Run(new MainForm(a));
            }
        }

        public static void Log(string msg)
        {
            try
            {
                string dir = Path.Combine(Path.GetTempPath(), "SteamLiteUpdater");
                Directory.CreateDirectory(dir);
                File.AppendAllText(Path.Combine(dir, "updater.log"), DateTime.Now.ToString("s") + "  " + msg + "\r\n");
            }
            catch { }
        }

        static Dictionary<string, string> ParseArgs(string[] args)
        {
            Dictionary<string, string> d = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            for (int i = 0; i < args.Length; i++)
            {
                if (!args[i].StartsWith("--")) continue;
                string k = args[i].Substring(2);
                string v = "";
                if (i + 1 < args.Length && !args[i + 1].StartsWith("--")) { v = args[i + 1]; i++; }
                d[k] = v;
            }
            return d;
        }
    }

    // A flat, rounded progress bar (the stock one can't be themed).
    class SlProgress : Control
    {
        double val; bool marquee; float pos; readonly System.Windows.Forms.Timer tick = new System.Windows.Forms.Timer();
        public Color Track = Color.FromArgb(38, 43, 56), Fill = Color.FromArgb(102, 192, 244);
        public SlProgress()
        {
            SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.UserPaint | ControlStyles.ResizeRedraw, true);
            tick.Interval = 25;
            tick.Tick += delegate { pos += 0.018f; if (pos > 1.3f) pos = -0.3f; Invalidate(); };
        }
        public double Value { get { return val; } set { val = Math.Max(0, Math.Min(1, value)); Invalidate(); } }
        public bool Marquee { get { return marquee; } set { marquee = value; if (value) tick.Start(); else tick.Stop(); Invalidate(); } }
        static GraphicsPath Round(RectangleF r)
        {
            float d = Math.Min(r.Height, r.Width);
            GraphicsPath p = new GraphicsPath();
            p.AddArc(r.X, r.Y, d, d, 90, 180);
            p.AddArc(r.Right - d, r.Y, d, d, 270, 180);
            p.CloseFigure();
            return p;
        }
        protected override void OnPaint(PaintEventArgs e)
        {
            e.Graphics.Clear(Parent != null ? Parent.BackColor : BackColor);
            e.Graphics.SmoothingMode = SmoothingMode.AntiAlias;
            RectangleF all = new RectangleF(0, 0, Width - 1, Height - 1);
            using (GraphicsPath p = Round(all)) using (SolidBrush b = new SolidBrush(Track)) e.Graphics.FillPath(b, p);
            RectangleF f;
            if (marquee) { float w = all.Width * 0.3f; f = new RectangleF(all.X + all.Width * pos, 0, w, all.Height); }
            else f = new RectangleF(0, 0, (float)(all.Width * val), all.Height);
            RectangleF clip = RectangleF.Intersect(f, all);
            if (clip.Width < 2) return;
            e.Graphics.SetClip(all);
            using (GraphicsPath p = Round(clip))
            using (LinearGradientBrush b = new LinearGradientBrush(clip, Fill, Color.FromArgb(150, 120, 255), 0f)) e.Graphics.FillPath(b, p);
        }
    }

    class SlButton : Button
    {
        public SlButton(bool primary)
        {
            FlatStyle = FlatStyle.Flat;
            Font = new Font("Segoe UI Semibold", 10f);
            Cursor = Cursors.Hand;
            FlatAppearance.BorderSize = primary ? 0 : 1;
            FlatAppearance.BorderColor = Color.FromArgb(60, 67, 84);
            BackColor = primary ? Color.FromArgb(102, 192, 244) : Color.FromArgb(28, 32, 42);
            ForeColor = primary ? Color.FromArgb(10, 14, 22) : Color.FromArgb(220, 226, 240);
            FlatAppearance.MouseOverBackColor = primary ? Color.FromArgb(130, 208, 252) : Color.FromArgb(40, 46, 60);
            FlatAppearance.MouseDownBackColor = primary ? Color.FromArgb(80, 170, 225) : Color.FromArgb(34, 39, 52);
            UseVisualStyleBackColor = false;
        }
    }

    class MainForm : Form
    {
        // ---- configuration ----
        const string UninstKey = @"Software\Microsoft\Windows\CurrentVersion\Uninstall\SteamLite";
        static readonly Color Bg = Color.FromArgb(13, 15, 20), Card = Color.FromArgb(22, 26, 34),
            Text1 = Color.FromArgb(232, 236, 244), Muted = Color.FromArgb(139, 147, 167),
            Accent = Color.FromArgb(102, 192, 244), Good = Color.FromArgb(120, 220, 140), Bad = Color.FromArgb(255, 110, 110);

        enum Stage { Checking, UpToDate, Available, Downloading, Installing, Done, Failed }

        // ---- state ----
        readonly Dictionary<string, string> args;
        readonly string repo = "SteamLite";
        string vfile = "version.json";
        bool betaChannel;
        LinkLabel chanLink;
        const string PrefKey = @"Software\SteamLite Updater";
        string installedVersion = "", latestVersion = "", releaseUrl = "", assetUrl = "", installDir = "", installMode = "";
        string installerPath = "";
        volatile bool cancel;
        Stage stage = Stage.Checking;
        bool failedDuringInstall;

        // ---- controls ----
        Label title, status, installedLbl, latestLbl, notesHead, detail;
        Panel verCard;
        TextBox notes;
        SlProgress bar;
        CheckBox launchChk;
        SlButton primary, secondary;
        LinkLabel link, versionsLink;
        bool autoStart;

        [DllImport("dwmapi.dll")] static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, ref int val, int size);

        public MainForm(Dictionary<string, string> a)
        {
            args = a;
            autoStart = a.ContainsKey("auto"); // started by SteamLite's "install when I close" - go straight to the download
            string ch; a.TryGetValue("channel", out ch);
            // the channel you picked inside the updater wins; otherwise whatever SteamLite passed in
            string saved = ReadChannelPref();
            betaChannel = saved.Length > 0 ? saved == "beta" : string.Equals(ch, "beta", StringComparison.OrdinalIgnoreCase);
            vfile = betaChannel ? "version-beta.json" : "version.json";
            BuildUi();
            ReadInstall();
            installedLbl.Text = installedVersion.Length > 0 ? "v" + installedVersion : "unknown";
            Shown += delegate { StartCheck(); };
        }

        static string ReadChannelPref()
        {
            try { using (RegistryKey k = Registry.CurrentUser.OpenSubKey(PrefKey)) { object v = k == null ? null : k.GetValue("Channel"); return v == null ? "" : Convert.ToString(v); } }
            catch { return ""; }
        }

        static void WriteChannelPref(string v)
        {
            try { using (RegistryKey k = Registry.CurrentUser.CreateSubKey(PrefKey)) { k.SetValue("Channel", v); } } catch { }
        }

        void UpdateChannelLink()
        {
            chanLink.Text = betaChannel ? "Channel: Beta  -  switch to Stable" : "Channel: Stable  -  switch to Beta";
        }

        void OnChannelSwitch()
        {
            if (stage == Stage.Downloading || stage == Stage.Installing || stage == Stage.Checking) return;
            betaChannel = !betaChannel;
            vfile = betaChannel ? "version-beta.json" : "version.json";
            WriteChannelPref(betaChannel ? "beta" : "stable");
            UpdateChannelLink();
            StartCheck();
        }

        // ================= UI =================
        void BuildUi()
        {
            Text = "SteamLite Updater";
            DoubleBuffered = true; // no flicker when the labels and progress bar repaint
            AutoScaleDimensions = new SizeF(96f, 96f);
            AutoScaleMode = AutoScaleMode.Dpi;
            ClientSize = new Size(520, 448);
            FormBorderStyle = FormBorderStyle.FixedSingle;
            MaximizeBox = false;
            StartPosition = FormStartPosition.CenterScreen;
            BackColor = Bg; ForeColor = Text1;
            Font = new Font("Segoe UI", 9.5f);
            try { Icon = Icon.ExtractAssociatedIcon(Assembly.GetExecutingAssembly().Location); } catch { }

            title = L("SteamLite Updater", 24, 18, 472, 30, new Font("Segoe UI Semibold", 17f), Text1);
            chanLink = new LinkLabel { Left = 276, Top = 24, Width = 220, Height = 20, TextAlign = ContentAlignment.MiddleRight, LinkColor = Accent, ActiveLinkColor = Color.White, VisitedLinkColor = Accent, BackColor = Bg, Font = new Font("Segoe UI", 8.5f) };
            chanLink.LinkBehavior = LinkBehavior.HoverUnderline;
            chanLink.Click += delegate { OnChannelSwitch(); };
            Controls.Add(chanLink);
            chanLink.BringToFront();
            UpdateChannelLink();
            status = L("Checking for updates...", 24, 50, 472, 36, new Font("Segoe UI", 10f), Muted);
            status.AutoEllipsis = false;

            verCard = new Panel { Left = 24, Top = 88, Width = 472, Height = 66, BackColor = Card };
            Controls.Add(verCard);
            verCard.Controls.Add(L("INSTALLED", 18, 10, 150, 16, new Font("Segoe UI", 7.5f, FontStyle.Bold), Muted));
            installedLbl = L("-", 18, 28, 190, 30, new Font("Segoe UI Semibold", 15f), Text1);
            verCard.Controls.Add(installedLbl);
            verCard.Controls.Add(L("→", 212, 22, 40, 30, new Font("Segoe UI", 15f), Muted));
            verCard.Controls.Add(L("LATEST", 270, 10, 150, 16, new Font("Segoe UI", 7.5f, FontStyle.Bold), Muted));
            latestLbl = L("-", 270, 28, 190, 30, new Font("Segoe UI Semibold", 15f), Text1);
            verCard.Controls.Add(latestLbl);

            notesHead = L("What's new", 24, 168, 300, 20, new Font("Segoe UI Semibold", 10f), Text1);
            notes = new TextBox
            {
                Left = 24, Top = 192, Width = 472, Height = 126, Multiline = true, ReadOnly = true, ScrollBars = ScrollBars.Vertical,
                BorderStyle = BorderStyle.None, BackColor = Card, ForeColor = Color.FromArgb(200, 206, 222), Font = new Font("Segoe UI", 9.5f), TabStop = false
            };
            Controls.Add(notes);

            bar = new SlProgress { Left = 24, Top = 336, Width = 472, Height = 10 };
            Controls.Add(bar);
            detail = L("", 24, 352, 472, 20, new Font("Segoe UI", 9f), Muted);

            versionsLink = new LinkLabel { Left = 310, Top = 378, Width = 186, Height = 20, Text = "Other versions...", TextAlign = ContentAlignment.MiddleRight, LinkColor = Accent, ActiveLinkColor = Color.White, VisitedLinkColor = Accent, BackColor = Bg, Visible = false };
            versionsLink.LinkBehavior = LinkBehavior.HoverUnderline;
            versionsLink.Click += delegate { OnOtherVersions(); };
            Controls.Add(versionsLink);

            launchChk = new CheckBox { Left = 24, Top = 376, Width = 280, Height = 22, Text = "Launch SteamLite when finished", Checked = true, ForeColor = Color.FromArgb(190, 197, 214), FlatStyle = FlatStyle.Standard };
            launchChk.BackColor = Bg;
            launchChk.CheckedChanged += delegate { if (stage == Stage.Done) primary.Text = launchChk.Checked ? "Launch SteamLite" : "Close"; };
            Controls.Add(launchChk);

            link = new LinkLabel { Left = 24, Top = 410, Width = 180, Height = 20, Text = "View release on GitHub", LinkColor = Accent, ActiveLinkColor = Color.White, VisitedLinkColor = Accent, BackColor = Bg, Visible = false };
            link.LinkBehavior = LinkBehavior.HoverUnderline;
            link.Click += delegate { try { Process.Start(releaseUrl); } catch { } };
            Controls.Add(link);

            secondary = new SlButton(false) { Left = 214, Top = 400, Width = 130, Height = 36, Text = "Check again" };
            primary = new SlButton(true) { Left = 356, Top = 400, Width = 140, Height = 36, Text = "Update now" };
            primary.Click += delegate { OnPrimary(); };
            secondary.Click += delegate { OnSecondary(); };
            Controls.Add(secondary); Controls.Add(primary);
            AcceptButton = primary;
            FormClosing += OnClosing;
        }

        Label L(string t, int x, int y, int w, int h, Font f, Color c)
        {
            Label l = new Label { Text = t, Left = x, Top = y, Width = w, Height = h, Font = f, ForeColor = c, BackColor = Color.Transparent, AutoEllipsis = true };
            // labels inside the version card sit on the card colour; the rest on the page
            Controls.Add(l);
            return l;
        }

        protected override void OnHandleCreated(EventArgs e)
        {
            base.OnHandleCreated(e);
            try { int on = 1; DwmSetWindowAttribute(Handle, 20, ref on, 4); } catch { } // dark title bar
        }

        void UI(Action act) { if (IsDisposed) return; if (InvokeRequired) { try { BeginInvoke(act); } catch { } } else act(); }

        void SetStage(Stage s, string statusText, Color statusColor)
        {
            stage = s;
            status.Text = statusText; status.ForeColor = statusColor;
            bool busy = s == Stage.Checking || s == Stage.Downloading || s == Stage.Installing;
            bar.Visible = s == Stage.Downloading || s == Stage.Installing || s == Stage.Checking;
            launchChk.Visible = s == Stage.Available || s == Stage.Downloading || s == Stage.Installing || s == Stage.Done || (s == Stage.Failed && failedDuringInstall);
            notes.Visible = notesHead.Visible = s == Stage.Available || s == Stage.Downloading || s == Stage.Installing || s == Stage.Done || s == Stage.Failed;
            link.Visible = releaseUrl.Length > 0 && !busy;
            versionsLink.Visible = !busy && s != Stage.Done;
            switch (s)
            {
                case Stage.Checking: bar.Marquee = true; detail.Text = ""; primary.Visible = false; secondary.Text = "Close"; secondary.Enabled = true; break;
                case Stage.UpToDate: bar.Marquee = false; primary.Visible = false; secondary.Text = "Check again"; primary.Text = "Launch SteamLite"; break;
                case Stage.Available: bar.Marquee = false; bar.Visible = false; primary.Visible = true; primary.Enabled = true; primary.Text = "Update now"; secondary.Text = "Not now"; secondary.Enabled = true; break;
                case Stage.Downloading: bar.Marquee = false; primary.Visible = false; secondary.Text = "Cancel"; break;
                case Stage.Installing: bar.Marquee = true; primary.Visible = false; secondary.Enabled = false; break;
                case Stage.Done: bar.Marquee = false; bar.Visible = false; primary.Visible = true; primary.Enabled = true; primary.Text = launchChk.Checked ? "Launch SteamLite" : "Close"; secondary.Text = "Close"; secondary.Enabled = true; break;
                case Stage.Failed: bar.Marquee = false; bar.Visible = false; primary.Visible = true; primary.Enabled = true; primary.Text = "Try again"; secondary.Text = "Close"; secondary.Enabled = true; break;
            }
            if (s == Stage.UpToDate) { primary.Visible = installDir.Length > 0; primary.Text = "Launch SteamLite"; }
            secondary.Left = primary.Visible ? 214 : 356; secondary.Width = primary.Visible ? 130 : 140;
            primary.TabIndex = 0; secondary.TabIndex = 1;
            if (primary.Visible) ActiveControl = primary; else if (secondary.Enabled) ActiveControl = secondary;
            if (s != Stage.Downloading && s != Stage.Installing) detail.Text = s == Stage.Checking ? "" : detail.Text;
        }

        // ================= buttons =================
        void OnPrimary()
        {
            Program.Log("primary clicked, stage=" + stage);
            switch (stage)
            {
                case Stage.Available: StartDownload(); break;
                case Stage.UpToDate: LaunchApp(); Close(); break;
                case Stage.Done: if (launchChk.Checked) LaunchApp(); Close(); break;
                case Stage.Failed: if (failedDuringInstall && File.Exists(installerPath)) StartInstall(); else if (assetUrl.Length > 0) StartDownload(); else StartCheck(); break;
            }
        }

        void OnSecondary()
        {
            switch (stage)
            {
                case Stage.Downloading: cancel = true; break;
                case Stage.UpToDate: StartCheck(); break;
                default: Close(); break;
            }
        }

        void OnClosing(object sender, FormClosingEventArgs e)
        {
            Program.Log("closing: " + e.CloseReason + " stage=" + stage + "\r\n" + Environment.StackTrace);
            if (stage == Stage.Installing)
            {
                e.Cancel = true;
                MessageBox.Show(this, "SteamLite is being installed. Please wait a moment.", "SteamLite Updater", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }
            cancel = true;
        }

        // ================= install info =================
        void ReadInstall()
        {
            // --dir is the folder of the SteamLite that started us. A PC can hold more than one registry entry (an old
            // "just me" install next to a newer "all users" one), so prefer the entry for that folder; without it,
            // take the newest entry whose SteamLite.exe is really there.
            string dir; args.TryGetValue("dir", out dir);
            string foundVer = "", foundDir = "", foundMode = "";
            foreach (RegistryHive hive in new[] { RegistryHive.CurrentUser, RegistryHive.LocalMachine })
                foreach (RegistryView view in new[] { RegistryView.Registry32, RegistryView.Registry64 })
                {
                    try
                    {
                        using (RegistryKey bk = RegistryKey.OpenBaseKey(hive, view))
                        using (RegistryKey k = bk.OpenSubKey(UninstKey))
                        {
                            if (k == null) continue;
                            string loc = k.GetValue("InstallLocation") as string;
                            string ver = (k.GetValue("DisplayVersion") as string) ?? "";
                            if (string.IsNullOrEmpty(loc) || !File.Exists(Path.Combine(loc, "SteamLite.exe"))) continue;
                            bool matches = !string.IsNullOrEmpty(dir) && string.Equals(loc.TrimEnd('\\'), dir.TrimEnd('\\'), StringComparison.OrdinalIgnoreCase);
                            bool newer = foundDir.Length == 0 || Cmp(ver, foundVer) > 0;
                            if (matches || newer)
                            {
                                foundDir = loc; foundVer = ver; foundMode = hive == RegistryHive.LocalMachine ? "/AllUsers" : "/CurrentUser";
                            }
                            if (matches) goto done;
                        }
                    }
                    catch { }
                }
            done:
            installDir = foundDir; installMode = foundMode;
            if (installDir.Length == 0 && !string.IsNullOrEmpty(dir) && File.Exists(Path.Combine(dir, "SteamLite.exe"))) installDir = dir;
            string cur; args.TryGetValue("current", out cur);
            installedVersion = !string.IsNullOrEmpty(cur) ? cur : foundVer;
        }

        void LaunchApp()
        {
            try
            {
                string exe = Path.Combine(installDir, "SteamLite.exe");
                if (File.Exists(exe)) Process.Start(new ProcessStartInfo(exe) { WorkingDirectory = installDir, UseShellExecute = true });
            }
            catch { }
        }

        // ================= check =================
        void StartCheck()
        {
            failedDuringInstall = false; cancel = false;
            // forget the previous result, so a failed re-check can't "Try again" into downloading an old version
            assetUrl = ""; latestVersion = ""; releaseUrl = "";
            ReadInstall();
            installedLbl.Text = installedVersion.Length > 0 ? "v" + installedVersion : "unknown";
            latestLbl.Text = "-"; latestLbl.ForeColor = Text1;
            SetStage(Stage.Checking, "Checking for updates...", Muted);
            Thread t = new Thread(CheckWorker) { IsBackground = true };
            t.Start();
        }

        static string Http(string url, string accept)
        {
            HttpWebRequest r = (HttpWebRequest)WebRequest.Create(url);
            r.UserAgent = "SteamLite-Updater"; r.Timeout = 15000; r.ReadWriteTimeout = 15000;
            if (accept != null) r.Accept = accept;
            using (HttpWebResponse resp = (HttpWebResponse)r.GetResponse())
            using (StreamReader sr = new StreamReader(resp.GetResponseStream(), Encoding.UTF8))
                return sr.ReadToEnd().TrimStart('﻿');
        }

        static Dictionary<string, object> Json(string text)
        {
            return new JavaScriptSerializer().Deserialize<Dictionary<string, object>>(text);
        }

        static int Cmp(string a, string b)
        {
            string[] p = a.Split('-')[0].Split('.'), q = b.Split('-')[0].Split('.');
            for (int i = 0; i < 3; i++)
            {
                int x = 0, y = 0;
                if (i < p.Length) int.TryParse(p[i], out x);
                if (i < q.Length) int.TryParse(q[i], out y);
                if (x != y) return x > y ? 1 : -1;
            }
            bool ab = a.Contains("beta"), bb = b.Contains("beta");
            if (ab && !bb) return -1;
            if (!ab && bb) return 1;
            if (ab && bb) { int na = BetaNo(a), nb = BetaNo(b); if (na != nb) return na > nb ? 1 : -1; }
            return 0;
        }

        // "9.0.0-beta" is beta 1, "9.0.0-beta.2" is beta 2
        static int BetaNo(string v)
        {
            int i = v.IndexOf("beta", StringComparison.OrdinalIgnoreCase);
            if (i < 0) return 0;
            string rest = v.Substring(i + 4).TrimStart('.', '-');
            int n; return int.TryParse(rest, out n) ? n : 1;
        }

        void CheckWorker()
        {
            string[][] sources = new string[][]
            {
                new[] { "https://raw.githubusercontent.com/imnotfisy/" + repo + "/refs/heads/main/" + vfile, null },
                new[] { "https://api.github.com/repos/imnotfisy/" + repo + "/contents/" + vfile + "?ref=main", "application/vnd.github.raw+json" }
            };
            Dictionary<string, object> v = null; string err = "";
            foreach (string[] s in sources)
            {
                try { v = Json(Http(s[0], s[1])); if (v != null && v.ContainsKey("version")) break; v = null; }
                catch (Exception ex) { err = ex.Message; }
            }
            if (v == null) { Fail("Could not check for updates (" + err + "). Check your internet connection, firewall or antivirus.", false); return; }

            string ver = Convert.ToString(v["version"]);
            string page = v.ContainsKey("downloadUrl") ? Convert.ToString(v["downloadUrl"]) : "";
            string asset = page.EndsWith(".exe", StringComparison.OrdinalIgnoreCase)
                ? page
                : "https://github.com/imnotfisy/" + repo + "/releases/download/v" + ver + "/SteamLite.Setup." + ver + ".exe";
            string noteText = "";
            try
            {
                Dictionary<string, object> news = Json(Http("https://raw.githubusercontent.com/imnotfisy/" + repo + "/refs/heads/main/news.json", null));
                Dictionary<string, object> cl = news.ContainsKey("changelog") ? news["changelog"] as Dictionary<string, object> : null;
                if (cl != null && Convert.ToString(cl["version"]) == ver && cl.ContainsKey("items"))
                {
                    StringBuilder sb = new StringBuilder();
                    string t = cl.ContainsKey("title") ? Convert.ToString(cl["title"]) : "";
                    if (t.Length > 0) sb.Append(t).Append("\r\n\r\n");
                    foreach (object it in (IEnumerable)cl["items"]) sb.Append("• ").Append(Convert.ToString(it)).Append("\r\n\r\n");
                    noteText = sb.ToString().TrimEnd();
                }
            }
            catch { }
            if (betaChannel && v.ContainsKey("notes") && Convert.ToString(v["notes"]).Length > 0) noteText = Convert.ToString(v["notes"]).Replace("\n", "\r\n");
            if (noteText.Length == 0) noteText = "Bug fixes and general improvements.";

            UI(delegate
            {
                latestVersion = ver; releaseUrl = page.EndsWith(".exe", StringComparison.OrdinalIgnoreCase) ? "https://github.com/imnotfisy/" + repo + "/releases" : (page.Length > 0 ? page : "https://github.com/imnotfisy/" + repo + "/releases");
                assetUrl = asset;
                latestLbl.Text = "v" + ver;
                notes.Text = noteText;
                bool backToStable = !betaChannel && installedVersion.Contains("beta") && !ver.Contains("beta");
                bool newer = installedVersion.Length == 0 || Cmp(ver, installedVersion) > 0 || backToStable;
                if (newer)
                {
                    latestLbl.ForeColor = Accent;
                    SetStage(Stage.Available, installedVersion.Length == 0 ? "Version " + ver + " is available." : (backToStable ? "You are on a beta. The latest stable version is " + ver + "." : "An update is available."), Text1);
                    if (autoStart) { autoStart = false; StartDownload(); }
                }
                else
                {
                    latestLbl.ForeColor = Good;
                    notes.Text = ""; notesHead.Visible = notes.Visible = false;
                    SetStage(Stage.UpToDate, "You're on the latest version.", Good);
                }
            });
        }

        void Fail(string msg, bool duringInstall)
        {
            Program.Log("Fail: " + msg);
            UI(delegate
            {
                failedDuringInstall = duringInstall;
                if (stage == Stage.Checking) { notes.Text = ""; }
                SetStage(Stage.Failed, msg, Bad);
                if (stage == Stage.Failed && !duringInstall && latestVersion.Length == 0) { notesHead.Visible = notes.Visible = false; }
                detail.Text = "";
            });
        }

        // ================= other versions (also a way back to an older one) =================
        void OnOtherVersions()
        {
            versionsLink.Enabled = false;
            ThreadPool.QueueUserWorkItem(delegate
            {
                List<string[]> items = new List<string[]>();
                string err = null;
                try
                {
                    string txt = Http("https://api.github.com/repos/imnotfisy/" + repo + "/releases?per_page=30", "application/vnd.github+json");
                    JavaScriptSerializer ser = new JavaScriptSerializer(); ser.MaxJsonLength = int.MaxValue;
                    object o = ser.DeserializeObject(txt);
                    foreach (object r in (IEnumerable)o)
                    {
                        Dictionary<string, object> d = r as Dictionary<string, object>;
                        if (d == null || !d.ContainsKey("assets")) continue;
                        if (!betaChannel && d.ContainsKey("prerelease") && d["prerelease"] is bool && (bool)d["prerelease"]) continue; // betas only show on the beta channel
                        string tag = Convert.ToString(d["tag_name"]).TrimStart('v');
                        string html = d.ContainsKey("html_url") ? Convert.ToString(d["html_url"]) : "";
                        foreach (object a in (IEnumerable)d["assets"])
                        {
                            Dictionary<string, object> ad = a as Dictionary<string, object>;
                            if (ad == null) continue;
                            string an = Convert.ToString(ad["name"]);
                            if (an.StartsWith("SteamLite.Setup.") && an.EndsWith(".exe", StringComparison.OrdinalIgnoreCase))
                            {
                                items.Add(new string[] { tag, Convert.ToString(ad["browser_download_url"]), html });
                                break;
                            }
                        }
                    }
                }
                catch (Exception ex) { err = ex.Message; }
                UI(delegate { versionsLink.Enabled = true; ShowVersionPicker(items, err); });
            });
        }

        void ShowVersionPicker(List<string[]> items, string err)
        {
            if (items.Count == 0)
            {
                MessageBox.Show(this, "Could not load the list of versions" + (err != null ? " (" + err + ")" : "") + ".", "SteamLite Updater", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }
            Form f = new Form { Text = "Other versions", FormBorderStyle = FormBorderStyle.FixedDialog, StartPosition = FormStartPosition.CenterParent, MaximizeBox = false, MinimizeBox = false, ShowInTaskbar = false, ClientSize = new Size(400, 372), BackColor = Bg, ForeColor = Text1, Font = new Font("Segoe UI", 9.5f) };
            Label head = new Label { Left = 20, Top = 16, Width = 360, Height = 22, Text = "Pick a version to install", Font = new Font("Segoe UI Semibold", 11f), ForeColor = Text1 };
            ListBox lb = new ListBox { Left = 20, Top = 46, Width = 360, Height = 218, BackColor = Card, ForeColor = Text1, BorderStyle = BorderStyle.None, Font = new Font("Segoe UI", 10.5f), IntegralHeight = false };
            for (int i = 0; i < items.Count; i++)
            {
                string v = items[i][0], tag = "";
                if (i == 0) tag += "  (latest)";
                if (installedVersion.Length > 0 && v == installedVersion) tag += "  (installed)";
                lb.Items.Add("v" + v + tag);
            }
            lb.SelectedIndex = 0;
            Label warn = new Label { Left = 20, Top = 272, Width = 360, Height = 44, Text = "Your games, settings and achievements are kept. Going back to an older version can hide features that only exist in newer ones.", ForeColor = Muted, Font = new Font("Segoe UI", 9f) };
            SlButton ok = new SlButton(true) { Left = 232, Top = 324, Width = 148, Height = 34, Text = "Install this version" };
            SlButton cancelBtn = new SlButton(false) { Left = 112, Top = 324, Width = 110, Height = 34, Text = "Cancel" };
            ok.Click += delegate { if (lb.SelectedIndex >= 0) { f.DialogResult = DialogResult.OK; f.Close(); } };
            cancelBtn.Click += delegate { f.DialogResult = DialogResult.Cancel; f.Close(); };
            lb.DoubleClick += delegate { if (lb.SelectedIndex >= 0) { f.DialogResult = DialogResult.OK; f.Close(); } };
            f.Controls.Add(head); f.Controls.Add(lb); f.Controls.Add(warn); f.Controls.Add(ok); f.Controls.Add(cancelBtn);
            f.AcceptButton = ok; f.CancelButton = cancelBtn;
            try { int on = 1; DwmSetWindowAttribute(f.Handle, 20, ref on, 4); } catch { }
            if (f.ShowDialog(this) != DialogResult.OK || lb.SelectedIndex < 0) return;
            string[] pick = items[lb.SelectedIndex];
            if (installedVersion.Length > 0 && pick[0] == installedVersion)
            {
                if (MessageBox.Show(this, "v" + pick[0] + " is already installed. Reinstall it?", "SteamLite Updater", MessageBoxButtons.YesNo, MessageBoxIcon.Question) != DialogResult.Yes) return;
            }
            latestVersion = pick[0]; assetUrl = pick[1]; releaseUrl = pick[2];
            latestLbl.Text = "v" + pick[0]; latestLbl.ForeColor = Accent;
            bool older = installedVersion.Length > 0 && Cmp(pick[0], installedVersion) < 0;
            notes.Text = (older ? "Going back to version " : "Installing version ") + pick[0] + ". Your games, settings and achievements are kept.";
            StartDownload();
        }

        // ================= download =================
        void StartDownload()
        {
            Program.Log("StartDownload " + assetUrl);
            cancel = false; failedDuringInstall = false;
            bar.Value = 0;
            SetStage(Stage.Downloading, "Downloading v" + latestVersion + "...", Text1);
            detail.Text = "Starting...";
            Thread t = new Thread(DownloadWorker) { IsBackground = true };
            t.Start();
        }

        static string FmtMb(double b) { return (b / 1048576.0).ToString("0.0") + " MB"; }

        void DownloadWorker()
        {
            string final = Path.Combine(Path.GetTempPath(), "SteamLite.Setup." + latestVersion + ".exe");
            string part = final + ".part";
            try
            {
                if (File.Exists(final)) File.Delete(final);
                long have = File.Exists(part) ? new FileInfo(part).Length : 0;
                HttpWebRequest r = (HttpWebRequest)WebRequest.Create(assetUrl);
                r.UserAgent = "SteamLite-Updater"; r.Timeout = 30000; r.ReadWriteTimeout = 30000; r.AllowAutoRedirect = true;
                if (have > 0) r.AddRange(have);
                long total;
                Stopwatch sw = Stopwatch.StartNew();
                long startOffset;
                using (HttpWebResponse resp = (HttpWebResponse)r.GetResponse())
                {
                    bool resumed = resp.StatusCode == HttpStatusCode.PartialContent;
                    if (!resumed) have = 0;
                    startOffset = have;
                    total = resp.ContentLength > 0 ? resp.ContentLength + have : 0;
                    using (Stream src = resp.GetResponseStream())
                    using (FileStream dst = new FileStream(part, resumed ? FileMode.Append : FileMode.Create, FileAccess.Write, FileShare.Read))
                    {
                        byte[] buf = new byte[81920];
                        long last = 0; int n;
                        while ((n = src.Read(buf, 0, buf.Length)) > 0)
                        {
                            if (cancel) { UI(delegate { SetStage(Stage.Available, "Download cancelled.", Muted); }); return; }
                            dst.Write(buf, 0, n); have += n;
                            if (sw.ElapsedMilliseconds - last >= 120)
                            {
                                last = sw.ElapsedMilliseconds;
                                double secs = Math.Max(0.2, sw.Elapsed.TotalSeconds);
                                double speed = (have - startOffset) / secs;
                                long h = have, tt = total;
                                UI(delegate { ShowProgress(h, tt, speed); });
                            }
                        }
                    }
                }
                FileInfo fi = new FileInfo(part);
                if ((total > 0 && fi.Length != total) || fi.Length < 20L * 1024 * 1024)
                {
                    try { File.Delete(part); } catch { }
                    Fail("The download was incomplete or invalid. Please try again.", false); return;
                }
                File.Move(part, final);
                installerPath = final;
                UI(delegate { StartInstall(); });
            }
            catch (Exception ex)
            {
                // keep the .part file: "Try again" resumes where this stopped
                Fail("Download failed: " + ex.Message, false);
            }
        }

        void ShowProgress(long have, long total, double speed)
        {
            if (stage != Stage.Downloading) return;
            if (total > 0)
            {
                bar.Value = (double)have / total;
                double left = speed > 1 ? (total - have) / speed : 0;
                string eta = left > 0 ? (left >= 60 ? Math.Ceiling(left / 60) + " min left" : Math.Ceiling(left) + " s left") : "";
                detail.Text = FmtMb(have) + " of " + FmtMb(total) + "  ·  " + FmtMb(speed) + "/s" + (eta.Length > 0 ? "  ·  " + eta : "");
            }
            else detail.Text = FmtMb(have) + "  ·  " + FmtMb(speed) + "/s";
        }

        // ================= install =================
        void StartInstall()
        {
            SetStage(Stage.Installing, "Installing v" + latestVersion + "...", Text1);
            detail.Text = "SteamLite will be closed while it updates. Windows may ask for permission.";
            Thread t = new Thread(InstallWorker) { IsBackground = true };
            t.Start();
        }

        void InstallWorker()
        {
            try
            {
                foreach (Process p in Process.GetProcessesByName("SteamLite")) { try { p.Kill(); p.WaitForExit(3000); } catch { } }
                string argsLine = "/S" + (installMode.Length > 0 ? " " + installMode : "");
                ProcessStartInfo psi = new ProcessStartInfo(installerPath, argsLine) { UseShellExecute = true };
                int code;
                using (Process p = Process.Start(psi)) { p.WaitForExit(); code = p.ExitCode; }
                if (code != 0) { Fail("The installer stopped with code " + code + ". Try again, or run the installer manually from your Temp folder.", true); return; }
                try { File.Delete(installerPath); } catch { }
                UI(delegate
                {
                    ReadInstall();
                    installedLbl.Text = "v" + latestVersion; installedLbl.ForeColor = Good;
                    SetStage(Stage.Done, "SteamLite " + latestVersion + " is installed.", Good);
                    detail.Text = "";
                    primary.Text = launchChk.Checked ? "Launch SteamLite" : "Close";
                });
            }
            catch (Win32Exception ex)
            {
                if (ex.NativeErrorCode == 1223) Fail("The update was not installed because the permission request was cancelled.", true);
                else Fail("Could not start the installer: " + ex.Message, true);
            }
            catch (Exception ex) { Fail("Install failed: " + ex.Message, true); }
        }
    }
}
