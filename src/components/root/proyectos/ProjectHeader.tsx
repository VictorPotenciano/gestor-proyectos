import CreateButton from "../CreateButton";

interface ProjectHeaderProps {
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProjectHeader = ({ setDialogOpen }: ProjectHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
        <p className="text-gray-500">
          Gestiona todos tus proyectos en un solo lugar
        </p>
      </div>
      <CreateButton
        label="Crear Proyecto"
        onClick={() => {
          setDialogOpen(true);
        }}
      />
    </div>
  );
};

export default ProjectHeader;
