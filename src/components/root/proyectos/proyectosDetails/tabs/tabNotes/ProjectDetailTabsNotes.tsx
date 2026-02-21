import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Note, Project } from "../../../../../../../typing";
import { useState } from "react";
import TabNotesDialog from "./TabNotesDialog";
import Pagination from "../Pagination";
import TabNotesCard from "./TabNotesCard";

interface ProjectDetailTabsNotesProps {
  project: Project;
  loadProject: (
    actPage: number,
    tskPage: number,
    cmtPage: number,
    showLoader?: boolean
  ) => void;
  tasksPage: number;
  commentsPage: number;
  activitiesPage: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  isPending: boolean;
}

const ProjectDetailTabsNotes = ({
  project,
  loadProject,
  tasksPage,
  commentsPage,
  activitiesPage,
  pagination,
  onPageChange,
  isPending,
}: ProjectDetailTabsNotesProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);

  const handleEditNote = (note: Note) => {
    setDialogOpen(true);
    setCurrentNote(note);
    setIsEditingNote(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentNote(null);
    setIsEditingNote(false);
  };

  return (
    <TabsContent value="notas">
      <Card className="border-blue-600 shadow-lg rounded-2xl overflow-hidden p-0">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 bg-linear-to-r from-blue-50 to-white border-b border-blue-100 px-5 py-5 md:py-4">
          <div className="flex flex-col gap-1.5 min-w-0">
            <CardTitle className="text-xl md:text-2xl text-blue-700 font-semibold flex items-center gap-2.5 flex-wrap">
              <MessageSquare className="h-5 w-5 md:h-6 md:w-6 shrink-0" />
              Notas del Proyecto
            </CardTitle>
            <p className="text-sm text-gray-600 md:text-base">
              Notas internas, recordatorios y observaciones del equipo
            </p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm whitespace-nowrap shrink-0 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2 shrink-0" />
            Nueva Nota
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {!project.comments || project.comments.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-10 w-10 text-blue-600" />
              </div>
              <p className="text-gray-600 font-medium">
                No hay notas en este proyecto
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {project.comments.map((note) => (
                  <TabNotesCard
                    key={note.id}
                    note={note}
                    handleEditNote={handleEditNote}
                    loadProject={() =>
                      loadProject(activitiesPage, tasksPage, commentsPage)
                    }
                    setError={setError}
                    activitiesPage={activitiesPage}
                    tasksPage={tasksPage}
                    commentsPage={commentsPage}
                  />
                ))}
              </div>
              <Pagination
                currentPage={commentsPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                onPageChange={onPageChange}
                disabled={isPending}
                itemLabel="notas"
              />
            </>
          )}
        </CardContent>
      </Card>
      <TabNotesDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        loadProject={() => loadProject(activitiesPage, tasksPage, commentsPage)}
        error={error}
        setError={setError}
        currentNote={currentNote}
        isEditingNote={isEditingNote}
        activitiesPage={activitiesPage}
        tasksPage={tasksPage}
        commentsPage={commentsPage}
        projectId={project.id}
      />
    </TabsContent>
  );
};

export default ProjectDetailTabsNotes;
