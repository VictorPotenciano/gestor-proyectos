import Swal from "sweetalert2";
import { Project } from "../../typing";
import {
  cancelProject,
  completeProject,
  inProgressProject,
  pausedProject,
} from "@/lib/projectapi";

export const useProjectActions = (
  selectedProject: Project | null,
  loadProjects: () => void,
  refreshLogs: () => Promise<void>,
  setError?: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const handleCompleteProject = async () => {
    if (!selectedProject) {
      await Swal.fire({
        title: "Error",
        text: "El proyecto no se encuentra",
        icon: "error",
        confirmButtonText: "Aceptar",
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
        },
      });
      return;
    }

    const invalidStatuses = ["COMPLETADO", "CANCELADO", "PAUSADO"];

    if (invalidStatuses.includes(selectedProject.status)) {
      let messageText = "";
      switch (selectedProject.status) {
        case "COMPLETADO":
          messageText = "El proyecto ya está completado.";
          break;
        case "CANCELADO":
          messageText = "No se puede completar un proyecto cancelado.";
          break;
        case "PAUSADO":
          messageText = "No se puede completar un proyecto pausado.";
          break;
        default:
      }
      await Swal.fire({
        title: "Acción no válida",
        text: messageText,
        icon: "warning",
        confirmButtonText: "Aceptar",
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
        },
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: "Confirmar Acción",
        text: "Esta acción marcará el proyecto como completado",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Completar",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
          cancelButton: "swal-custom-button-cancel",
        },
      });
      if (result.isConfirmed) {
        await completeProject(selectedProject.id);
        loadProjects();
        await refreshLogs();
        Swal.fire({
          title: "Compleatado!",
          text: "El proyecto ha sido completado con exito.",
          icon: "success",
          buttonsStyling: false,
          customClass: {
            confirmButton: "swal-custom-button",
          },
          confirmButtonText: "Continuar",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error inesperado";
      setError?.(errorMessage);
    }
  };

  const handlePausedProject = async () => {
    if (!selectedProject) {
      await Swal.fire({
        title: "Error",
        text: "El proyecto no se encuentra",
        icon: "error",
        confirmButtonText: "Aceptar",
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
        },
      });
      return;
    }

    const invalidStatuses = ["COMPLETADO", "CANCELADO", "PAUSADO"];

    if (invalidStatuses.includes(selectedProject.status)) {
      let messageText = "";
      switch (selectedProject.status) {
        case "COMPLETADO":
          messageText = "No se puede pausar un proyecto completado.";
          break;
        case "CANCELADO":
          messageText = "No se puede pausar un proyecto cancelado.";
          break;
        case "PAUSADO":
          messageText = "El proyecto ya está pausado.";
          break;
        default:
      }
      await Swal.fire({
        title: "Acción no válida",
        text: messageText,
        icon: "warning",
        confirmButtonText: "Aceptar",
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
        },
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: "Confirmar Acción",
        text: "Esta acción marcará el proyecto como pausado",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Pausar",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
          cancelButton: "swal-custom-button-cancel",
        },
      });
      if (result.isConfirmed) {
        await pausedProject(selectedProject.id);
        loadProjects();
        await refreshLogs();
        Swal.fire({
          title: "Pausado!",
          text: "El proyecto ha sido pausado con exito.",
          icon: "success",
          buttonsStyling: false,
          customClass: {
            confirmButton: "swal-custom-button",
          },
          confirmButtonText: "Continuar",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error inesperado";
      setError?.(errorMessage);
    }
  };

  const handleInProgressProject = async () => {
    if (!selectedProject) {
      await Swal.fire({
        title: "Error",
        text: "El proyecto no se encuentra",
        icon: "error",
        confirmButtonText: "Aceptar",
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
        },
      });
      return;
    }

    const invalidStatuses = ["COMPLETADO", "CANCELADO", "EN_PROCESO"];

    if (invalidStatuses.includes(selectedProject.status)) {
      let messageText = "";
      switch (selectedProject.status) {
        case "COMPLETADO":
          messageText = "No se puede poner en proceso un proyecto completado.";
          break;
        case "CANCELADO":
          messageText = "No se puede poner en proceso un proyecto cancelado.";
          break;
        case "EN_PROCESO":
          messageText = "El proyecto ya está en proceso.";
          break;
        default:
      }
      await Swal.fire({
        title: "Acción no válida",
        text: messageText,
        icon: "warning",
        confirmButtonText: "Aceptar",
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
        },
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: "Confirmar Acción",
        text: "Esta acción marcará el proyecto como en proceso",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Aceptar",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
          cancelButton: "swal-custom-button-cancel",
        },
      });
      if (result.isConfirmed) {
        await inProgressProject(selectedProject.id);
        loadProjects();
        await refreshLogs();
        Swal.fire({
          title: "En proceso!",
          text: "El proyecto ha sido puesto en proceso con exito.",
          icon: "success",
          buttonsStyling: false,
          customClass: {
            confirmButton: "swal-custom-button",
          },
          confirmButtonText: "Continuar",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error inesperado";
      setError?.(errorMessage);
    }
  };

  const handleCancelProject = async () => {
    if (!selectedProject) {
      await Swal.fire({
        title: "Error",
        text: "El proyecto no se encuentra",
        icon: "error",
        confirmButtonText: "Aceptar",
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
        },
      });
      return;
    }

    const invalidStatuses = ["COMPLETADO", "CANCELADO"];

    if (invalidStatuses.includes(selectedProject.status)) {
      let messageText = "";
      switch (selectedProject.status) {
        case "COMPLETADO":
          messageText = "No se puede cancelar un proyecto completado.";
          break;
        case "CANCELADO":
          messageText = "El proyecto ya está cancelado.";
          break;
        default:
      }
      await Swal.fire({
        title: "Acción no válida",
        text: messageText,
        icon: "warning",
        confirmButtonText: "Aceptar",
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
        },
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: "Confirmar Acción",
        text: "Esta acción marcará el proyecto como cancelado",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Aceptar",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
          cancelButton: "swal-custom-button-cancel",
        },
      });
      if (result.isConfirmed) {
        await cancelProject(selectedProject.id);
        loadProjects();
        await refreshLogs();
        Swal.fire({
          title: "Cancelado!",
          text: "El proyecto ha sido cancelado con exito.",
          icon: "success",
          buttonsStyling: false,
          customClass: {
            confirmButton: "swal-custom-button",
          },
          confirmButtonText: "Continuar",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error inesperado";
      setError?.(errorMessage);
    }
  };

  return {
    handleCompleteProject,
    handlePausedProject,
    handleInProgressProject,
    handleCancelProject,
  };
};
