import { useState, useEffect } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

interface OpenShift {
  id: number;
  register_name: string;
  opened_at: string;
  opening_float: number;
}

export default function ShiftPage() {
  const [openShifts, setOpenShifts] = useState<OpenShift[]>([]);
  const [registerId, setRegisterId] = useState("");
  const [openingFloat, setOpeningFloat] = useState("");
  const [closingAmount, setClosingAmount] = useState("");
  const [selectedShift, setSelectedShift] = useState<number | null>(null);

  useEffect(() => {
    loadOpenShifts();
  }, []);

  const loadOpenShifts = async () => {
    try {
      const res = await fetch("/api/v2/pos/shifts/open?branch_id=1", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.ok) {
        setOpenShifts(data.data);
      }
    } catch (e) {
      console.error("Load shifts error:", e);
    }
  };

  const openShift = async () => {
    try {
      const res = await fetch("/api/v2/pos/shifts/open", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          register_id: Number(registerId),
          opening_float: Number(openingFloat),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        alert("Shift opened");
        loadOpenShifts();
        setRegisterId("");
        setOpeningFloat("");
      } else {
        alert(data.error.message);
      }
    } catch (e) {
      console.error("Open shift error:", e);
    }
  };

  const closeShift = async () => {
    if (!selectedShift) return;
    try {
      const res = await fetch("/api/v2/pos/shifts/close", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          shift_id: selectedShift,
          closing_amount: Number(closingAmount),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        alert("Shift closed");
        loadOpenShifts();
        setSelectedShift(null);
        setClosingAmount("");
      }
    } catch (e) {
      console.error("Close shift error:", e);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Open Shift */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">فتح وردية</h3>
        <div className="space-y-4">
          <Input
            type="number"
            placeholder="رقم السجل"
            value={registerId}
            onChange={(e) => setRegisterId(e.target.value)}
          />
          <Input
            type="number"
            placeholder="رصيد البداية"
            value={openingFloat}
            onChange={(e) => setOpeningFloat(e.target.value)}
            step="0.01"
          />
          <Button onClick={openShift} disabled={!registerId || !openingFloat}>
            فتح الوردية
          </Button>
        </div>
      </Card>

      {/* Close Shift */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">إغلاق وردية</h3>
        <div className="space-y-4">
          <Select
            value={selectedShift?.toString() || ""}
            onChange={(v) => setSelectedShift(Number(v))}
            options={openShifts.map((shift) => ({
              value: shift.id.toString(),
              label: `${shift.register_name} - ${new Date(shift.opened_at).toLocaleString("ar-SA")}`,
            }))}
            placeholder="اختر الوردية المفتوحة"
          />
          <Input
            type="number"
            placeholder="رصيد النهاية"
            value={closingAmount}
            onChange={(e) => setClosingAmount(e.target.value)}
            step="0.01"
          />
          <Button onClick={closeShift} disabled={!selectedShift || !closingAmount}>
            إغلاق الوردية
          </Button>
        </div>
      </Card>

      {/* Open Shifts List */}
      <Card className="lg:col-span-2">
        <h3 className="text-lg font-semibold mb-4">الورديات المفتوحة</h3>
        <div className="space-y-2">
          {openShifts.map((shift) => (
            <div key={shift.id} className="p-3 border border-white/10 rounded">
              <div className="flex justify-between">
                <span>{shift.register_name}</span>
                <span>{new Date(shift.opened_at).toLocaleString("ar-SA")}</span>
                <span>رصيد البداية: {shift.opening_float.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
