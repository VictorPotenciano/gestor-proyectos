import CreateButton from "../CreateButton";

interface CustomerHeaderProps {
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CustomerHeader = ({ setDialogOpen }: CustomerHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <p className="text-gray-500">
          Gestiona tu cartera de clientes y sus proyectos
        </p>
      </div>
      <CreateButton
        label="Crear Cliente"
        onClick={() => {
          setDialogOpen(true);
        }}
      />
    </div>
  );
};

export default CustomerHeader;
