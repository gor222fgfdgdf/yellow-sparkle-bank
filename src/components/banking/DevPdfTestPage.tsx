import { useState } from "react";
import FullScreenModal from "./FullScreenModal";
import { Button } from "@/components/ui/button";
import { Capacitor } from "@capacitor/core";
import jsPDF from "jspdf";

interface DevPdfTestPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const DevPdfTestPage = ({ isOpen, onClose }: DevPdfTestPageProps) => {
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    console.log("[DEV]", msg);
    setLog((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  const makePdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Test PDF Document", 20, 30);
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 50);
    doc.text("If you can see this, PDF export works!", 20, 65);
    return doc;
  };

  // Method 1: <a download> (doesn't work on iOS WebView)
  const method1 = () => {
    addLog("M1: <a download> with blob URL");
    try {
      const doc = makePdf();
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "test_m1.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      addLog("M1: link.click() done");
    } catch (e: any) {
      addLog(`M1 ERROR: ${e?.message}`);
    }
  };

  // Method 2: window.open with blob URL
  const method2 = () => {
    addLog("M2: window.open(blobUrl)");
    try {
      const doc = makePdf();
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      const w = window.open(url, "_blank");
      addLog(`M2: window.open returned: ${w ? "window" : "null"}`);
    } catch (e: any) {
      addLog(`M2 ERROR: ${e?.message}`);
    }
  };

  // Method 3: window.open with data URI
  const method3 = () => {
    addLog("M3: window.open(dataURI)");
    try {
      const doc = makePdf();
      const dataUri = doc.output("datauristring");
      addLog(`M3: dataUri length: ${dataUri.length}`);
      const w = window.open(dataUri, "_blank");
      addLog(`M3: window.open returned: ${w ? "window" : "null"}`);
    } catch (e: any) {
      addLog(`M3 ERROR: ${e?.message}`);
    }
  };

  // Method 4: window.location.href = data URI
  const method4 = () => {
    addLog("M4: window.location.href = dataURI");
    try {
      const doc = makePdf();
      const dataUri = doc.output("datauristring");
      window.location.href = dataUri;
      addLog("M4: location set");
    } catch (e: any) {
      addLog(`M4 ERROR: ${e?.message}`);
    }
  };

  // Method 5: embed in new window
  const method5 = () => {
    addLog("M5: new window with <embed> + dataURI");
    try {
      const doc = makePdf();
      const dataUri = doc.output("datauristring");
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(
          `<html><head><title>PDF</title></head><body style="margin:0">` +
          `<embed src="${dataUri}" type="application/pdf" width="100%" height="100%" ` +
          `style="position:fixed;top:0;left:0;width:100%;height:100%"></body></html>`
        );
        w.document.close();
        addLog("M5: embed written");
      } else {
        addLog("M5: popup blocked");
      }
    } catch (e: any) {
      addLog(`M5 ERROR: ${e?.message}`);
    }
  };

  // Method 6: iframe src = blob URL
  const method6 = () => {
    addLog("M6: iframe with blob URL");
    try {
      const doc = makePdf();
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = url;
      document.body.appendChild(iframe);
      addLog("M6: iframe added");
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      }, 10000);
    } catch (e: any) {
      addLog(`M6 ERROR: ${e?.message}`);
    }
  };

  // Method 7: Capacitor Filesystem + Share
  const method7 = async () => {
    addLog("M7: Capacitor Filesystem + Share");
    try {
      const { Filesystem, Directory } = await import("@capacitor/filesystem");
      const { Share } = await import("@capacitor/share");
      addLog("M7: plugins imported OK");

      const doc = makePdf();
      const base64 = doc.output("datauristring").split(",")[1];

      const result = await Filesystem.writeFile({
        path: "test_m7.pdf",
        data: base64,
        directory: Directory.Cache,
      });
      addLog(`M7: file written to ${result.uri}`);

      await Share.share({
        title: "test_m7.pdf",
        url: result.uri,
        dialogTitle: "Сохранить PDF",
      });
      addLog("M7: share dialog shown");
    } catch (e: any) {
      addLog(`M7 ERROR: ${e?.message}`);
    }
  };

  // Method 8: <a> with blob URL + target _blank (no download attr)
  const method8 = () => {
    addLog("M8: <a> blob URL target=_blank (no download)");
    try {
      const doc = makePdf();
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addLog("M8: click done");
    } catch (e: any) {
      addLog(`M8 ERROR: ${e?.message}`);
    }
  };

  // Method 9: base64 in new tab via object tag
  const method9 = () => {
    addLog("M9: new window with <object> tag");
    try {
      const doc = makePdf();
      const dataUri = doc.output("datauristring");
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(
          `<html><head><title>PDF</title></head><body style="margin:0;padding:0">` +
          `<object data="${dataUri}" type="application/pdf" width="100%" height="100%" ` +
          `style="position:fixed;top:0;left:0;width:100%;height:100%">` +
          `<p>PDF не поддерживается</p></object></body></html>`
        );
        w.document.close();
        addLog("M9: object written");
      } else {
        addLog("M9: popup blocked");
      }
    } catch (e: any) {
      addLog(`M9 ERROR: ${e?.message}`);
    }
  };

  // Method 10: navigator.share() with File object (Web Share API)
  const method10 = async () => {
    addLog("M10: navigator.share() with File");
    try {
      if (!navigator.share) {
        addLog("M10: navigator.share NOT available");
        return;
      }
      if (!navigator.canShare) {
        addLog("M10: navigator.canShare NOT available");
      }
      const doc = makePdf();
      const blob = doc.output("blob");
      const file = new File([blob], "test_m10.pdf", { type: "application/pdf" });
      
      const shareData = { files: [file], title: "Test PDF" };
      if (navigator.canShare && !navigator.canShare(shareData)) {
        addLog("M10: canShare returned false, trying without files...");
        // fallback: share URL
        return;
      }
      
      await navigator.share(shareData);
      addLog("M10: share completed!");
    } catch (e: any) {
      addLog(`M10 ERROR: ${e?.message}`);
    }
  };

  // Method 11: navigator.share() with blob URL (not file)
  const method11 = async () => {
    addLog("M11: navigator.share() with url (blob)");
    try {
      if (!navigator.share) {
        addLog("M11: navigator.share NOT available");
        return;
      }
      const doc = makePdf();
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      await navigator.share({ title: "Test PDF", url });
      addLog("M11: share completed!");
    } catch (e: any) {
      addLog(`M11 ERROR: ${e?.message}`);
    }
  };

  // Method 12: <a> with data URI + download attr
  const method12 = () => {
    addLog("M12: <a download> with dataURI");
    try {
      const doc = makePdf();
      const dataUri = doc.output("datauristring");
      const link = document.createElement("a");
      link.href = dataUri;
      link.download = "test_m12.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addLog("M12: click done");
    } catch (e: any) {
      addLog(`M12 ERROR: ${e?.message}`);
    }
  };

  // Method 13: inline embed in current page
  const [inlinePdf, setInlinePdf] = useState<string | null>(null);
  const method13 = () => {
    addLog("M13: inline embed in current page");
    try {
      const doc = makePdf();
      const dataUri = doc.output("datauristring");
      setInlinePdf(dataUri);
      addLog("M13: embedded in page");
    } catch (e: any) {
      addLog(`M13 ERROR: ${e?.message}`);
    }
  };

  const isNative = Capacitor.isNativePlatform();
  const hasCapUA = navigator.userAgent.includes("CapacitorApp");
  const hasWebShare = typeof navigator.share === "function";
  const hasCanShare = typeof navigator.canShare === "function";

  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose} title="🛠 Dev: PDF Test">
      <div className="space-y-4">
        <div className="bg-muted/50 rounded-xl p-3 text-xs font-mono space-y-1">
          <p>navigator.share: <strong>{String(hasWebShare)}</strong></p>
          <p>navigator.canShare: <strong>{String(hasCanShare)}</strong></p>
          <p>isNativePlatform: <strong>{String(isNative)}</strong></p>
          <p>UA has CapacitorApp: <strong>{String(hasCapUA)}</strong></p>
          <p className="break-all">UA: {navigator.userAgent}</p>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Button variant="outline" onClick={method1} className="justify-start text-left h-auto py-3">
            <div>
              <p className="font-semibold">M1: &lt;a download&gt;</p>
              <p className="text-xs text-muted-foreground">Стандартная ссылка на скачивание</p>
            </div>
          </Button>

          <Button variant="outline" onClick={method2} className="justify-start text-left h-auto py-3">
            <div>
              <p className="font-semibold">M2: window.open(blobUrl)</p>
              <p className="text-xs text-muted-foreground">Открыть blob в новом окне</p>
            </div>
          </Button>

          <Button variant="outline" onClick={method3} className="justify-start text-left h-auto py-3">
            <div>
              <p className="font-semibold">M3: window.open(dataURI)</p>
              <p className="text-xs text-muted-foreground">Открыть data URI в новом окне</p>
            </div>
          </Button>

          <Button variant="outline" onClick={method4} className="justify-start text-left h-auto py-3">
            <div>
              <p className="font-semibold">M4: location.href = dataURI</p>
              <p className="text-xs text-muted-foreground">⚠️ Перенаправит текущую страницу</p>
            </div>
          </Button>

          <Button variant="outline" onClick={method5} className="justify-start text-left h-auto py-3">
            <div>
              <p className="font-semibold">M5: new window + &lt;embed&gt;</p>
              <p className="text-xs text-muted-foreground">Embed с data URI в новом окне</p>
            </div>
          </Button>

          <Button variant="outline" onClick={method6} className="justify-start text-left h-auto py-3">
            <div>
              <p className="font-semibold">M6: hidden iframe</p>
              <p className="text-xs text-muted-foreground">Невидимый iframe с blob URL</p>
            </div>
          </Button>

          <Button variant="outline" onClick={method7} className="justify-start text-left h-auto py-3">
            <div>
              <p className="font-semibold">M7: Capacitor Filesystem + Share</p>
              <p className="text-xs text-muted-foreground">Нативные плагины Capacitor</p>
            </div>
          </Button>

          <Button variant="outline" onClick={method8} className="justify-start text-left h-auto py-3">
            <div>
              <p className="font-semibold">M8: &lt;a&gt; blob _blank (no download)</p>
              <p className="text-xs text-muted-foreground">Ссылка без атрибута download</p>
            </div>
          </Button>

          <Button variant="outline" onClick={method9} className="justify-start text-left h-auto py-3">
            <div>
              <p className="font-semibold">M9: new window + &lt;object&gt;</p>
              <p className="text-xs text-muted-foreground">Object тег в новом окне</p>
            </div>
          </Button>

          <Button variant="outline" onClick={method10} className="justify-start text-left h-auto py-3 border-primary">
            <div>
              <p className="font-semibold">⭐ M10: navigator.share(File)</p>
              <p className="text-xs text-muted-foreground">Web Share API с PDF файлом</p>
            </div>
          </Button>

          <Button variant="outline" onClick={method11} className="justify-start text-left h-auto py-3 border-primary">
            <div>
              <p className="font-semibold">⭐ M11: navigator.share(url)</p>
              <p className="text-xs text-muted-foreground">Web Share API с blob URL</p>
            </div>
          </Button>

          <Button variant="outline" onClick={method12} className="justify-start text-left h-auto py-3">
            <div>
              <p className="font-semibold">M12: &lt;a download&gt; dataURI</p>
              <p className="text-xs text-muted-foreground">Ссылка с data URI</p>
            </div>
          </Button>

          <Button variant="outline" onClick={method13} className="justify-start text-left h-auto py-3">
            <div>
              <p className="font-semibold">M13: inline embed</p>
              <p className="text-xs text-muted-foreground">Встроить PDF прямо в страницу</p>
            </div>
          </Button>
        </div>

        {inlinePdf && (
          <div className="rounded-xl overflow-hidden border border-border">
            <div className="flex items-center justify-between p-2 bg-muted">
              <p className="text-xs font-semibold">Встроенный PDF (M13):</p>
              <Button variant="ghost" size="sm" onClick={() => setInlinePdf(null)}>Закрыть</Button>
            </div>
            <embed src={inlinePdf} type="application/pdf" width="100%" height="400" />
          </div>
        )}

        {log.length > 0 && (
          <div className="bg-muted rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">Логи:</p>
              <Button variant="ghost" size="sm" onClick={() => setLog([])}>Очистить</Button>
            </div>
            <div className="space-y-1 text-xs font-mono max-h-60 overflow-y-auto">
              {log.map((l, i) => (
                <p key={i} className="text-muted-foreground">{l}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </FullScreenModal>
  );
};

export default DevPdfTestPage;
