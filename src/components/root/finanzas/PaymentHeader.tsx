import CreateButton from "../CreateButton";

interface PaymentHeaderProps {
  setIsPaymentDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const PaymentHeader = ({ setIsPaymentDialogOpen }: PaymentHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pagos</h1>
        <p className="text-gray-500">Control de pagos y facturación</p>
      </div>
      <CreateButton
        label="Registrar Pago"
        onClick={() => {
          setIsPaymentDialogOpen(true);
        }}
      />
    </div>
  );
};

export default PaymentHeader;
