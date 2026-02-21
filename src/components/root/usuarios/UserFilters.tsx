import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface UserFiltersProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

const UserFilters = ({ searchTerm, setSearchTerm }: UserFiltersProps) => {
  return (
    <div className="relative w-full md:w-auto md:ml-auto">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
      <Input
        placeholder="Buscar usuarios..."
        className="pl-9 w-full text-blue-600"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default UserFilters;
