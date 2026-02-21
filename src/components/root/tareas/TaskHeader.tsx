const TaskHeader = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
        <p className="text-gray-500">Organiza y gestiona todas tus tareas</p>
      </div>
    </div>
  );
};

export default TaskHeader;
