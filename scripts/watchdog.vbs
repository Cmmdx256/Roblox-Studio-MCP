Set WshShell = CreateObject("WScript.Shell")
Set objWMIService = GetObject("winmgmts:\\.\root\cimv2")

Const NODE_EXE = "C:\Program Files\nodejs\node.exe"
Const BRIDGE_SCRIPT = "C:\Users\Theso\Desktop\roblox sc\Stdiomcp\dist\index.js"
Const WORK_DIR = "C:\Users\Theso\Desktop\roblox sc\Stdiomcp"

Function IsBridgeActive()
    On Error Resume Next
    Set objHttp = CreateObject("MSXML2.ServerXMLHTTP.6.0")
    objHttp.setTimeouts 500, 500, 500, 500
    objHttp.Open "GET", "http://127.0.0.1:38883/health", False
    objHttp.Send
    If Err.Number = 0 And objHttp.Status = 200 Then
        IsBridgeActive = True
    Else
        IsBridgeActive = False
    End If
    On Error GoTo 0
End Function

Do
    ' Check if bridge is responding, if not restart it
    If Not IsBridgeActive() Then
        WshShell.CurrentDirectory = WORK_DIR
        WshShell.Run """" & NODE_EXE & """ """ & BRIDGE_SCRIPT & """", 0, False
        WScript.Sleep 3000
    End If
    
    WScript.Sleep 3000
Loop
