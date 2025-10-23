import React from "react";
import PurchasePricesCard from "./PurchasePricesCard";
import ReceiptsCard from "./ReceiptsCard";
import PaymentsCard from "./PaymentsCard";
import ReturnsCard from "./ReturnsCard";
import ProfitCard from "./ProfitCard";
import PurchaseOrderCard from "./PurchaseOrderCard";
import type { DashboardAnalytics } from "../../../services/pharmacist";

type Props = {
  analytics: DashboardAnalytics;
};

export default function DashboardCharts({ analytics }: Props) {
  const { purchasePrices, receipts, payments, returns, profit, purchaseOrder } = analytics;

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <PurchasePricesCard {...purchasePrices} />
        <ReceiptsCard {...receipts} />
        <PaymentsCard {...payments} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <ReturnsCard {...returns} />
        <ProfitCard {...profit} />
        <PurchaseOrderCard {...purchaseOrder} />
      </div>
    </div>
  );
}
