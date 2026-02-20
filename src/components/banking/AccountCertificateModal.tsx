import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useProfile } from "@/hooks/useProfile";
import { useAccounts } from "@/hooks/useAccounts";

interface AccountCertificateModalProps {
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

const AccountCertificateModal = ({ isOpen, onClose }: AccountCertificateModalProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { data: profile } = useProfile();
  const { data: accounts } = useAccounts();

  const generateCertificatePDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const now = new Date();
    const pageWidth = 210;
    const margin = 20;
    let y = 20;

    // Bank header
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text('Joint Stock Company "Russian Agricultural Bank"', margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Gagarinsky pereulok, building 3,", margin, y);
    y += 4;
    doc.text("Moscow, Russian Federation, 119034", margin, y);
    y += 10;

    // Date and document number
    const docNumber = `${now.getFullYear()}/${Math.floor(100000 + Math.random() * 900000)}`;
    doc.setFontSize(9);
    const dateStr = `"${String(now.getDate()).padStart(2, "0")}" ${getMonthNameEn(now.getMonth())} ${now.getFullYear()}`;
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
    const descText = `In accordance with your request dated ${dateStr}, JSC "Rosselhozbank" provides information about the following accounts (deposits) opened at the Bank / about closed accounts (deposits):`;
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

    const tableData = (accounts || []).map((acc) => [
      acc.account_number || "N/A",
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

    if (footerY > 240) {
      doc.addPage();
      footerY = 20;
    }

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`The above information is provided as of ${dateStr}.`, margin, footerY);
    footerY += 16;

    // Signature block
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Deputy Director of Department", margin, footerY);
    doc.text("A. G. Osipenko", pageWidth - margin - 35, footerY);
    footerY += 6;

    // Signature line labels
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text("(Position of authorized person)", margin, footerY);
    doc.text("(signature)", pageWidth / 2 - 10, footerY);
    doc.text("(initials, surname)", pageWidth - margin - 30, footerY);
    doc.setTextColor(0, 0, 0);
    footerY += 14;

    // Stamp area
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);

    // Draw circular stamp
    const stampX = pageWidth / 2;
    const stampY = footerY + 5;
    const stampR = 18;

    doc.setDrawColor(40, 100, 60);
    doc.setLineWidth(0.6);
    doc.circle(stampX, stampY, stampR);
    doc.circle(stampX, stampY, stampR - 2);

    doc.setFontSize(6);
    doc.setTextColor(40, 100, 60);
    doc.setFont("helvetica", "bold");
    doc.text("Russian Agricultural", stampX, stampY - 6, { align: "center" });
    doc.text("Bank", stampX, stampY - 2, { align: "center" });
    doc.text('JSC "Rosselhozbank"', stampX, stampY + 2, { align: "center" });
    doc.text("MOSCOW", stampX, stampY + 6, { align: "center" });

    // Date under stamp
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(dateStr, stampX, stampY + stampR + 6, { align: "center" });

    return doc;
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const doc = generateCertificatePDF();
      doc.save(`certificate_accounts_${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("Справка скачана в PDF");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Ошибка при формировании справки");
    }
    setIsExporting(false);
  };

  const accountCount = accounts?.length || 0;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[60vh] rounded-t-3xl">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl">Справка о счетах</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 overflow-y-auto max-h-[calc(60vh-120px)]">
          <div className="bg-muted/50 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Справка об открытых/закрытых счетах</p>
                <p className="text-sm text-muted-foreground">Формат: PDF</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Документ содержит информацию обо всех ваших счетах ({accountCount} шт.), 
              открытых в АО «Россельхозбанк», с указанием номеров счетов, дат открытия, 
              валюты и текущих остатков.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-4 border border-border">
            <h4 className="font-medium text-foreground mb-2">Содержание справки:</h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>• Номера всех открытых счетов</li>
              <li>• Подразделение банка</li>
              <li>• Даты открытия счетов</li>
              <li>• Валюта и остатки</li>
              <li>• Печать и подпись уполномоченного лица</li>
            </ul>
          </div>

          <Button onClick={handleExport} className="w-full h-12" disabled={isExporting}>
            <Download className="w-5 h-5 mr-2" />
            {isExporting ? "Формирование..." : "Скачать справку"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AccountCertificateModal;
