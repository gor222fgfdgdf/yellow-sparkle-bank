import { useState, useMemo } from "react";
import FullScreenModal from "./FullScreenModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Pencil, X, Check, Search, ArrowUpDown, Copy, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAccounts } from "@/hooks/useAccounts";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface DevTransactionManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  name: string;
  category: string;
  amount: number;
  is_income: boolean | null;
  icon: string;
  date: string;
  created_at: string;
  currency: string;
  original_amount: number | null;
  commission: number | null;
}

const CATEGORIES = [
  "Продукты", "Рестораны", "Транспорт", "Развлечения", "Покупки", "Здоровье",
  "Связь", "Переводы", "Зарплата", "Доход", "ЖКХ", "Образование", "Снятие наличных",
  "Пополнение", "Комиссия", "Другое",
];

const ICONS = [
  "ShoppingCart", "Coffee", "Car", "Tv", "ShoppingBag", "Heart", "Phone",
  "ArrowDownLeft", "ArrowUpRight", "Briefcase", "CreditCard", "Home",
  "Utensils", "Fuel", "Plane", "Gift", "BookOpen", "Banknote", "Landmark",
];

const CURRENCIES = ["RUB", "THB", "USD", "EUR", "CNY", "VND"];

const PAGE_SIZE = 50;

const DevTransactionManager = ({ isOpen, onClose }: DevTransactionManagerProps) => {
  const { user } = useAuth();
  const { data: accounts = [] } = useAccounts();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [filterAccount, setFilterAccount] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortField, setSortField] = useState<"date" | "amount" | "name">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Transaction>>({});

  // New transaction form
  const [showAdd, setShowAdd] = useState(false);
  const [newTx, setNewTx] = useState({
    name: "", category: "Другое", amount: 0, is_income: false,
    icon: "CreditCard", date: new Date().toISOString().split("T")[0],
    account_id: "", currency: "RUB", original_amount: "" as string,
    commission: "" as string,
  });

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Fetch ALL transactions
  const { data: allTransactions = [], isLoading, refetch } = useQuery({
    queryKey: ["dev-tx-manager", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user && isOpen,
  });

  const filtered = useMemo(() => {
    let result = allTransactions.filter((tx) => {
      if (filterAccount !== "all" && tx.account_id !== filterAccount) return false;
      if (filterCategory !== "all" && tx.category !== filterCategory) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!tx.name.toLowerCase().includes(s) && !tx.category.toLowerCase().includes(s) && !tx.id.includes(s)) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortField === "amount") cmp = a.amount - b.amount;
      else cmp = a.name.localeCompare(b.name);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [allTransactions, filterAccount, filterCategory, search, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["dev-tx-manager"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
    queryClient.invalidateQueries({ queryKey: ["dev-all-transactions"] });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) { toast.error("Ошибка удаления"); return; }
    toast.success("Удалено");
    invalidateAll();
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    const { error } = await supabase.from("transactions").delete().in("id", ids);
    if (error) { toast.error("Ошибка удаления"); return; }
    toast.success(`Удалено ${ids.length} транзакций`);
    setSelectedIds(new Set());
    invalidateAll();
  };

  const startEdit = (tx: Transaction) => {
    setEditingId(tx.id);
    setEditData({ ...tx });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { id, user_id, created_at, ...updateData } = editData as Transaction;
    const { error } = await supabase.from("transactions").update(updateData).eq("id", editingId);
    if (error) { toast.error("Ошибка сохранения: " + error.message); return; }
    toast.success("Сохранено");
    cancelEdit();
    invalidateAll();
  };

  const handleAdd = async () => {
    if (!user) return;
    if (!newTx.name || !newTx.account_id) { toast.error("Заполните название и счёт"); return; }
    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      name: newTx.name,
      category: newTx.category,
      amount: newTx.amount,
      is_income: newTx.is_income,
      icon: newTx.icon,
      date: newTx.date,
      account_id: newTx.account_id,
      currency: newTx.currency,
      original_amount: newTx.original_amount ? Number(newTx.original_amount) : null,
      commission: newTx.commission ? Number(newTx.commission) : null,
    });
    if (error) { toast.error("Ошибка: " + error.message); return; }
    toast.success("Транзакция добавлена");
    setShowAdd(false);
    setNewTx({ name: "", category: "Другое", amount: 0, is_income: false, icon: "CreditCard", date: new Date().toISOString().split("T")[0], account_id: accounts[0]?.id || "", currency: "RUB", original_amount: "", commission: "" });
    invalidateAll();
  };

  const handleDuplicate = (tx: Transaction) => {
    setShowAdd(true);
    setNewTx({
      name: tx.name,
      category: tx.category,
      amount: Math.abs(tx.amount),
      is_income: !!tx.is_income,
      icon: tx.icon,
      date: tx.date,
      account_id: tx.account_id,
      currency: tx.currency,
      original_amount: tx.original_amount?.toString() || "",
      commission: tx.commission?.toString() || "",
    });
  };

  const toggleSort = (field: "date" | "amount" | "name") => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === pageData.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(pageData.map(tx => tx.id)));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || id.slice(0, 8);

  const isFuture = (date: string) => new Date(date) > new Date();

  if (!isOpen) return null;

  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose} title="🛠 Управление транзакциями">
      <div style={{ minWidth: 900, maxWidth: 1400, margin: "0 auto" }}>
        {/* Filters bar */}
        <div style={{ display: "flex", gap: 12, alignItems: "end", marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Label className="text-xs">Поиск</Label>
            <div style={{ position: "relative" }}>
              <Search style={{ position: "absolute", left: 8, top: 10, width: 16, height: 16, color: "#888" }} />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Название, категория или ID..." style={{ paddingLeft: 32 }} />
            </div>
          </div>
          <div style={{ minWidth: 160 }}>
            <Label className="text-xs">Счёт</Label>
            <Select value={filterAccount} onValueChange={setFilterAccount}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все счета</SelectItem>
                {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div style={{ minWidth: 140 }}>
            <Label className="text-xs">Категория</Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => { setShowAdd(!showAdd); }} variant={showAdd ? "secondary" : "default"} size="sm">
            <Plus className="w-4 h-4 mr-1" /> Добавить
          </Button>
          {selectedIds.size > 0 && (
            <Button onClick={handleBulkDelete} variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-1" /> Удалить ({selectedIds.size})
            </Button>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 16, marginBottom: 12, fontSize: 13, color: "#666" }}>
          <span>Всего: <strong>{allTransactions.length}</strong></span>
          <span>Отфильтровано: <strong>{filtered.length}</strong></span>
          <span>Будущих: <strong>{allTransactions.filter(t => isFuture(t.date)).length}</strong></span>
        </div>

        {/* Add form */}
        {showAdd && (
          <div style={{ border: "2px solid hsl(var(--primary))", borderRadius: 12, padding: 16, marginBottom: 16, background: "hsl(var(--muted) / 0.3)" }}>
            <h3 style={{ fontWeight: 600, marginBottom: 12 }}>Новая транзакция</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
              <div>
                <Label className="text-xs">Название *</Label>
                <Input value={newTx.name} onChange={e => setNewTx(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Категория</Label>
                <Select value={newTx.category} onValueChange={v => setNewTx(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Сумма (в RUB) *</Label>
                <Input type="number" value={newTx.amount} onChange={e => setNewTx(p => ({ ...p, amount: Number(e.target.value) }))} />
              </div>
              <div>
                <Label className="text-xs">Дата *</Label>
                <Input type="date" value={newTx.date} onChange={e => setNewTx(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Счёт *</Label>
                <Select value={newTx.account_id} onValueChange={v => setNewTx(p => ({ ...p, account_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                  <SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Валюта операции</Label>
                <Select value={newTx.currency} onValueChange={v => setNewTx(p => ({ ...p, currency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Сумма в валюте</Label>
                <Input type="number" value={newTx.original_amount} onChange={e => setNewTx(p => ({ ...p, original_amount: e.target.value }))} placeholder="null" />
              </div>
              <div>
                <Label className="text-xs">Комиссия</Label>
                <Input type="number" value={newTx.commission} onChange={e => setNewTx(p => ({ ...p, commission: e.target.value }))} placeholder="0" />
              </div>
              <div>
                <Label className="text-xs">Иконка</Label>
                <Select value={newTx.icon} onValueChange={v => setNewTx(p => ({ ...p, icon: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ICONS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div style={{ display: "flex", alignItems: "end", gap: 8 }}>
                <div className="flex items-center gap-2">
                  <Switch checked={newTx.is_income} onCheckedChange={v => setNewTx(p => ({ ...p, is_income: v }))} />
                  <Label className="text-xs">{newTx.is_income ? "Доход" : "Расход"}</Label>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <Button onClick={handleAdd} size="sm"><Check className="w-4 h-4 mr-1" /> Создать</Button>
              <Button onClick={() => setShowAdd(false)} variant="ghost" size="sm"><X className="w-4 h-4 mr-1" /> Отмена</Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div style={{ overflowX: "auto", border: "1px solid hsl(var(--border))", borderRadius: 8 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "hsl(var(--muted))", borderBottom: "2px solid hsl(var(--border))" }}>
                <th style={{ padding: "8px 6px", width: 36 }}>
                  <input type="checkbox" checked={selectedIds.size === pageData.length && pageData.length > 0} onChange={toggleSelectAll} />
                </th>
                <th style={{ padding: "8px 6px", cursor: "pointer", userSelect: "none", textAlign: "left" }} onClick={() => toggleSort("date")}>
                  Дата {sortField === "date" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th style={{ padding: "8px 6px", cursor: "pointer", userSelect: "none", textAlign: "left" }} onClick={() => toggleSort("name")}>
                  Название {sortField === "name" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th style={{ padding: "8px 6px", textAlign: "left" }}>Категория</th>
                <th style={{ padding: "8px 6px", cursor: "pointer", userSelect: "none", textAlign: "right" }} onClick={() => toggleSort("amount")}>
                  Сумма {sortField === "amount" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th style={{ padding: "8px 6px", textAlign: "center" }}>Тип</th>
                <th style={{ padding: "8px 6px", textAlign: "left" }}>Валюта</th>
                <th style={{ padding: "8px 6px", textAlign: "right" }}>В валюте</th>
                <th style={{ padding: "8px 6px", textAlign: "right" }}>Комиссия</th>
                <th style={{ padding: "8px 6px", textAlign: "left" }}>Счёт</th>
                <th style={{ padding: "8px 6px", textAlign: "left" }}>Иконка</th>
                <th style={{ padding: "8px 6px", textAlign: "center", width: 120 }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={12} style={{ padding: 20, textAlign: "center", color: "#888" }}>Загрузка…</td></tr>
              )}
              {!isLoading && pageData.length === 0 && (
                <tr><td colSpan={12} style={{ padding: 20, textAlign: "center", color: "#888" }}>Нет транзакций</td></tr>
              )}
              {pageData.map((tx) => {
                const isEditing = editingId === tx.id;
                const ed = editData as Transaction;
                const future = isFuture(tx.date);

                return (
                  <tr
                    key={tx.id}
                    style={{
                      borderBottom: "1px solid hsl(var(--border))",
                      background: future ? "hsl(var(--primary) / 0.06)" : isEditing ? "hsl(var(--muted) / 0.5)" : "transparent",
                    }}
                  >
                    <td style={{ padding: "6px" }}>
                      <input type="checkbox" checked={selectedIds.has(tx.id)} onChange={() => toggleSelect(tx.id)} />
                    </td>
                    <td style={{ padding: "6px", whiteSpace: "nowrap" }}>
                      {isEditing ? (
                        <Input type="date" value={ed.date || ""} onChange={e => setEditData(p => ({ ...p, date: e.target.value }))} style={{ width: 140, fontSize: 12 }} />
                      ) : (
                        <span>{tx.date}{future && " 🔮"}</span>
                      )}
                    </td>
                    <td style={{ padding: "6px", maxWidth: 200 }}>
                      {isEditing ? (
                        <Input value={ed.name || ""} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} style={{ fontSize: 12 }} />
                      ) : (
                        <span title={tx.id} style={{ cursor: "help" }}>{tx.name}</span>
                      )}
                    </td>
                    <td style={{ padding: "6px" }}>
                      {isEditing ? (
                        <Select value={ed.category || ""} onValueChange={v => setEditData(p => ({ ...p, category: v }))}>
                          <SelectTrigger style={{ fontSize: 12 }}><SelectValue /></SelectTrigger>
                          <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      ) : tx.category}
                    </td>
                    <td style={{ padding: "6px", textAlign: "right", fontFamily: "monospace", color: tx.is_income ? "green" : "inherit" }}>
                      {isEditing ? (
                        <Input type="number" value={ed.amount ?? 0} onChange={e => setEditData(p => ({ ...p, amount: Number(e.target.value) }))} style={{ width: 100, fontSize: 12, textAlign: "right" }} />
                      ) : (
                        <span>{tx.is_income ? "+" : ""}{tx.amount.toLocaleString("ru-RU")}</span>
                      )}
                    </td>
                    <td style={{ padding: "6px", textAlign: "center" }}>
                      {isEditing ? (
                        <Switch checked={!!ed.is_income} onCheckedChange={v => setEditData(p => ({ ...p, is_income: v }))} />
                      ) : (
                        <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: tx.is_income ? "#d4edda" : "#f8d7da", color: tx.is_income ? "#155724" : "#721c24" }}>
                          {tx.is_income ? "Доход" : "Расход"}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "6px" }}>
                      {isEditing ? (
                        <Select value={ed.currency || "RUB"} onValueChange={v => setEditData(p => ({ ...p, currency: v }))}>
                          <SelectTrigger style={{ fontSize: 12, width: 80 }}><SelectValue /></SelectTrigger>
                          <SelectContent>{CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      ) : tx.currency}
                    </td>
                    <td style={{ padding: "6px", textAlign: "right", fontFamily: "monospace" }}>
                      {isEditing ? (
                        <Input type="number" value={ed.original_amount ?? ""} onChange={e => setEditData(p => ({ ...p, original_amount: e.target.value ? Number(e.target.value) : null }))} style={{ width: 90, fontSize: 12, textAlign: "right" }} placeholder="null" />
                      ) : (
                        tx.original_amount != null ? tx.original_amount.toLocaleString("ru-RU") : "—"
                      )}
                    </td>
                    <td style={{ padding: "6px", textAlign: "right", fontFamily: "monospace" }}>
                      {isEditing ? (
                        <Input type="number" value={ed.commission ?? ""} onChange={e => setEditData(p => ({ ...p, commission: e.target.value ? Number(e.target.value) : null }))} style={{ width: 80, fontSize: 12, textAlign: "right" }} placeholder="0" />
                      ) : (
                        tx.commission ? tx.commission.toLocaleString("ru-RU") : "0"
                      )}
                    </td>
                    <td style={{ padding: "6px", fontSize: 11 }}>
                      {isEditing ? (
                        <Select value={ed.account_id || ""} onValueChange={v => setEditData(p => ({ ...p, account_id: v }))}>
                          <SelectTrigger style={{ fontSize: 11 }}><SelectValue /></SelectTrigger>
                          <SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
                        </Select>
                      ) : getAccountName(tx.account_id)}
                    </td>
                    <td style={{ padding: "6px", fontSize: 11 }}>
                      {isEditing ? (
                        <Select value={ed.icon || ""} onValueChange={v => setEditData(p => ({ ...p, icon: v }))}>
                          <SelectTrigger style={{ fontSize: 11, width: 110 }}><SelectValue /></SelectTrigger>
                          <SelectContent>{ICONS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                        </Select>
                      ) : tx.icon}
                    </td>
                    <td style={{ padding: "6px", textAlign: "center" }}>
                      {isEditing ? (
                        <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                          <Button size="sm" variant="default" onClick={saveEdit} style={{ padding: "4px 8px" }}><Check className="w-3 h-3" /></Button>
                          <Button size="sm" variant="ghost" onClick={cancelEdit} style={{ padding: "4px 8px" }}><X className="w-3 h-3" /></Button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                          <Button size="sm" variant="ghost" onClick={() => startEdit(tx)} style={{ padding: "4px 6px" }} title="Редактировать"><Pencil className="w-3 h-3" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDuplicate(tx)} style={{ padding: "4px 6px" }} title="Дублировать"><Copy className="w-3 h-3" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(tx.id)} style={{ padding: "4px 6px", color: "hsl(var(--destructive))" }} title="Удалить"><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 12 }}>
            <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span style={{ fontSize: 13 }}>
              {page + 1} / {totalPages}
            </span>
            <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </FullScreenModal>
  );
};

export default DevTransactionManager;
