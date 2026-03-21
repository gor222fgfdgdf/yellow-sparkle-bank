import { useState, useMemo } from "react";
import FullScreenModal from "./FullScreenModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Share2, FileText, Calendar } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useProfile } from "@/hooks/useProfile";
import { useAccounts } from "@/hooks/useAccounts";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

import stampImg from "@/assets/rshb-stamp.png";
import signatureImg from "@/assets/rshb-signature.png";
import headerImg from "@/assets/rshb-header.png";

interface DevCertificateGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatDateRu = (date: Date) => {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
};

const formatAmount = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));
};

const getMonthNameEn = (month: number) => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return months[month];
};

const DevCertificateGenerator = ({ isOpen, onClose }: DevCertificateGeneratorProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [readyBlob, setReadyBlob] = useState<Blob | null>(null);
  const [readyFilename, setReadyFilename] = useState("");
  const [certificateDate, setCertificateDate] = useState<string>(() => {
    const future = new Date();
    future.setMonth(future.getMonth() + 1);
    return future.toISOString().slice(0, 10);
  });
  const [balanceDate, setBalanceDate] = useState<string>(() => {
    const future = new Date();
    future.setMonth(future.getMonth() + 1);
    return future.toISOString().slice(0, 10);
  });

  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: accounts = [] } = useAccounts();

  // Fetch ALL transactions without date filter (includes future)
  const { data: allTransactions = [] } = useQuery({
    queryKey: ["dev-all-transactions-cert", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("transactions")
        .select("account_id, amount, date")
        .eq("user_id", user.id);
      if (error) throw error;
      return data as { account_id: string; amount: number; date: string }[];
    },
    enabled: !!user && isOpen,
  });

  // Compute balances up to the selected certificate date
  const accountsWithFutureBalances = useMemo(() => {
    const balanceMap: Record<string, number> = {};
    for (const tx of allTransactions) {
      if (tx.date <= balanceDate) {
        balanceMap[tx.account_id] = (balanceMap[tx.account_id] || 0) + Number(tx.amount);
      }
    }
    return accounts.map((acc) => ({
      ...acc,
      balance: balanceMap[acc.id] ?? 0,
    }));
  }, [accounts, allTransactions, balanceDate]);

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const loadImageWithWhiteBg = (src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = src;
    });
  };

  const generateCertificatePDF = async () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const certDate = new Date(certificateDate);
    const pageWidth = 210;
    const margin = 20;
    let y = 12;

    // Bank header image
    try {
      const hdrImg = await loadImage(headerImg);
      doc.addImage(hdrImg, "PNG", margin, y, pageWidth - margin * 2, 14);
      y += 18;
    } catch {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text('Joint Stock Company "Russian Agricultural Bank"', margin, y);
      y += 8;
    }

    // Address
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Gagarinsky pereulok, building 3,", margin, y);
    y += 4;
    doc.text("Moscow, Russian Federation, 119034", margin, y);
    y += 10;

    // Date and document number
    const docNumber = `${certDate.getFullYear()}/${Math.floor(100000 + Math.random() * 900000)}`;
    doc.setFontSize(9);
    const dateStr = `"${String(certDate.getDate()).padStart(2, "0")}" ${getMonthNameEn(certDate.getMonth())} ${certDate.getFullYear()}`;
    doc.text(`${dateStr}    No. ${docNumber}`, margin, y);
    y += 12;

    // Title
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Certificate of Open/Closed Accounts (Deposits),", pageWidth / 2, y, { align: "center" });
    y += 6;
    doc.text("Absence of Accounts (Deposits)", pageWidth / 2, y, { align: "center" });
    y += 10;

    // Greeting
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const ownerName = profile?.full_name || "Account Holder";
    doc.text(`Dear ${ownerName}!`, margin, y);
    y += 8;

    // Description text
    doc.setFontSize(9);
    const balDate = new Date(balanceDate);
    const balDateStr = `"${String(balDate.getDate()).padStart(2, "0")}" ${getMonthNameEn(balDate.getMonth())} ${balDate.getFullYear()}`;
    const descText = `In accordance with your request dated ${dateStr}, JSC "Rosselhozbank" provides information about the following accounts (deposits) opened at the Bank as of ${balDateStr} / about closed accounts (deposits):`;
    const splitDesc = doc.splitTextToSize(descText, pageWidth - margin * 2);
    doc.text(splitDesc, margin, y);
    y += splitDesc.length * 5 + 4;

    // Accounts table
    const tableHeaders = [
      "Account Number",
      "Bank Branch",
      "Date Opened",
      "Date Closed",
      "Currency",
      "Balance",
    ];

    const filteredAccounts = accountsWithFutureBalances.filter((acc) => acc.account_number);
    const tableData = filteredAccounts.map((acc) => [
      acc.account_number,
      "1400",
      formatDateRu(new Date(acc.opened_at || acc.created_at)),
      "",
      "RUR",
      formatAmount(Number(acc.balance)),
    ]);

    autoTable(doc, {
      startY: y,
      head: [tableHeaders],
      body: tableData,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        font: "helvetica",
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
        overflow: "linebreak",
        valign: "middle",
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
        lineWidth: 0.3,
      },
      columnStyles: {
        0: { cellWidth: 42 },
        1: { cellWidth: 22, halign: "center" },
        2: { cellWidth: 26, halign: "center" },
        3: { cellWidth: 26, halign: "center" },
        4: { cellWidth: 20, halign: "center" },
        5: { cellWidth: 30, halign: "right" },
      },
      theme: "grid",
      margin: { left: margin, right: margin },
    });

    // Footer
    const finalY = (doc as any).lastAutoTable?.finalY || y + 40;
    let footerY = finalY + 12;

    if (footerY > 220) {
      doc.addPage();
      footerY = 20;
    }

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`The above information is provided as of ${balDateStr}.`, margin, footerY);
    footerY += 16;

    // Signature block
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Deputy Director of Department", margin, footerY);
    doc.text("A. G. Osipenko", pageWidth - margin - 35, footerY);

    try {
      const sigImg = await loadImage(signatureImg);
      doc.addImage(sigImg, "PNG", pageWidth / 2 - 15, footerY - 8, 30, 12);
    } catch {}

    footerY += 6;

    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text("(Position of authorized person)", margin, footerY);
    doc.text("(signature)", pageWidth / 2 - 10, footerY);
    doc.text("(initials, surname)", pageWidth - margin - 30, footerY);
    doc.setTextColor(0, 0, 0);
    footerY += 14;

    // Stamp
    try {
      const stmpDataUrl = await loadImageWithWhiteBg(stampImg);
      const stampSize = 40;
      const stampX = pageWidth / 2 - stampSize / 2;
      doc.addImage(stmpDataUrl, "PNG", stampX, footerY - 5, stampSize, stampSize);
      footerY += stampSize + 2;
    } catch {
      const sX = pageWidth / 2;
      const sY = footerY + 15;
      doc.setDrawColor(40, 100, 60);
      doc.setLineWidth(0.6);
      doc.circle(sX, sY, 18);
      doc.circle(sX, sY, 16);
      footerY = sY + 20;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(dateStr, pageWidth / 2, footerY, { align: "center" });

    return doc;
  };

  const handleExport = async () => {
    setIsExporting(true);
    setReadyBlob(null);
    try {
      const doc = await generateCertificatePDF();
      const filename = `certificate_accounts_${certificateDate}.pdf`;
      const blob = doc.output("blob");

      const file = new File([blob], filename, { type: "application/pdf" });
      const shareData = { files: [file], title: filename };
      if (navigator.canShare && navigator.canShare(shareData)) {
        setReadyBlob(blob);
        setReadyFilename(filename);
        toast.success("Справка готова — нажмите «Поделиться»");
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        toast.success("Справка скачана в PDF");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Ошибка при формировании справки");
    }
    setIsExporting(false);
  };

  const handleShare = async () => {
    if (!readyBlob) return;
    try {
      const file = new File([readyBlob], readyFilename, { type: "application/pdf" });
      await navigator.share({ files: [file], title: readyFilename });
      toast.success("Справка отправлена");
      setReadyBlob(null);
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        toast.error("Ошибка при отправке");
      }
    }
  };

  const accountCount = accountsWithFutureBalances.filter((a) => a.account_number).length;

  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose} title="🛠 Справка из будущего">
      <div className="space-y-6">
        {/* Date picker */}
        <div className="bg-muted/50 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Дата справки</h3>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Справка будет сформирована на эту дату с учётом всех транзакций</Label>
            <Input
              type="date"
              value={certificateDate}
              onChange={(e) => {
                setCertificateDate(e.target.value);
                setReadyBlob(null);
              }}
              className="mt-2"
            />
          </div>
        </div>

        {/* Info */}
        <div className="bg-muted/50 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Справка об открытых/закрытых счетах</p>
              <p className="text-sm text-muted-foreground">Формат: PDF • Дата: {formatDateRu(new Date(certificateDate))}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Документ содержит информацию обо всех ваших счетах ({accountCount} шт.),
            открытых в АО «Россельхозбанк», с балансами на {formatDateRu(new Date(certificateDate))}.
          </p>
        </div>

        <Button onClick={handleExport} className="w-full h-12" disabled={isExporting}>
          <Download className="w-5 h-5 mr-2" />
          {isExporting ? "Формирование..." : "Сформировать справку"}
        </Button>

        {readyBlob && (
          <Button onClick={handleShare} className="w-full h-12" variant="default">
            <Share2 className="w-5 h-5 mr-2" />
            Поделиться PDF
          </Button>
        )}
      </div>
    </FullScreenModal>
  );
};

export default DevCertificateGenerator;
