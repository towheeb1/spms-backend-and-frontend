import AccountingManager from "../../../components/pharmacist/pos/AccountingManager";

export default function AccountingDepartment(){
    return (
<>
<AccountingManager
            onDateRangeChange={(start, end) => {
              console.log('Date range changed:', start, end);
            }}
          />
</>
    );
}