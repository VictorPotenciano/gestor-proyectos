import { Plus } from "lucide-react";

interface CreateButtonProps {
  label: string;
  onClick: () => void;
}

const CreateButton = ({ label, onClick }: CreateButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm shadow-blue-200 cursor-pointer"
    >
      <Plus className="h-4 w-4" />
      {label}
    </button>
  );
};

export default CreateButton;
