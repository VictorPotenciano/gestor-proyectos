import Swal from "sweetalert2";
import { Task } from "../../typing";
import {
    cancelTask,
  completeTask,
  inProgressTask,
  pendingTask,
  priorityHighTask,
  priorityLowTask,
  priorityMediumTask,
  priorityUrgentTask,
  reviewTask,
} from "@/lib/taskapi";

export const useTaskActions = (
  selectedTask: Task | null,
  loadProjects: () => void,
  refreshLogs: () => Promise<void>,
  setError?: React.Dispatch<React.SetStateAction<string | null>>
) => {

  const handleCancelTask = async () => {
    if (!selectedTask) {
      await Swal.fire({
        title: "Error",
        text: "La tarea no se encuentra",
        icon: "error",
        confirmButtonText: "Aceptar",
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
        },
      });
      return;
    }

    const invalidStatuses = ["COMPLETADA", "CANCELADA"];

    if (invalidStatuses.includes(selectedTask.status)) {
      let messageText = "";
      switch (selectedTask.status) {
        case "COMPLETADA":
          messageText = "No se puede cancelar una tarea completada.";
          break;
        case "CANCELADA":
          messageText = "La tarea ya está cancelada.";
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
        text: "Esta acción marcará la tarea como cancelada",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Si, Cancelar",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
          cancelButton: "swal-custom-button-cancel",
        },
      });
      if (result.isConfirmed) {
        await cancelTask(selectedTask.id);
        loadProjects();
        await refreshLogs();
        Swal.fire({
          title: "Cancelada!",
          text: "La tarea ha sido cancelada con exito.",
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

  const handleCompleteTask = async () => {
    if (!selectedTask) {
      await Swal.fire({
        title: "Error",
        text: "La tarea no se encuentra",
        icon: "error",
        confirmButtonText: "Aceptar",
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
        },
      });
      return;
    }

    const invalidStatuses = ["COMPLETADA", "CANCELADA"];

    if (invalidStatuses.includes(selectedTask.status)) {
      let messageText = "";
      switch (selectedTask.status) {
        case "COMPLETADA":
          messageText = "La tarea ya está completada.";
          break;
        case "CANCELADA":
          messageText = "No se puede completar una tarea cancelada.";
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
        text: "Esta acción marcará la tarea como completada",
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
        await completeTask(selectedTask.id);
        loadProjects();
        await refreshLogs();
        Swal.fire({
          title: "Compleatado!",
          text: "La tarea ha sido completada con exito.",
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

  const handleInProgressTask = async () => {
    if (!selectedTask) {
      await Swal.fire({
        title: "Error",
        text: "La tarea no se encuentra",
        icon: "error",
        confirmButtonText: "Aceptar",
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
        },
      });
      return;
    }

    const invalidStatuses = ["COMPLETADA", "CANCELADA", "EN_PROGRESO"];

    if (invalidStatuses.includes(selectedTask.status)) {
      let messageText = "";
      switch (selectedTask.status) {
        case "EN_PROGRESO":
          messageText = "La tarea ya está en proceso.";
          break;
        case "COMPLETADA":
          messageText = "No se puede poner en proceso una tarea completada.";
          break;
        case "CANCELADA":
          messageText = "No se puede poner en proceso una tarea cancelada.";
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
        text: "Esta acción marcará la tarea como en progreso",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Poner en Progreso",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
          cancelButton: "swal-custom-button-cancel",
        },
      });
      if (result.isConfirmed) {
        await inProgressTask(selectedTask.id);
        loadProjects();
        await refreshLogs();
        Swal.fire({
          title: "En Progreso!",
          text: "La tarea ha sido puesta en progreso con exito.",
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

  const handlePendingTask = async () => {
    if (!selectedTask) {
      await Swal.fire({
        title: "Error",
        text: "La tarea no se encuentra",
        icon: "error",
        confirmButtonText: "Aceptar",
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
        },
      });
      return;
    }

    const invalidStatuses = ["COMPLETADA", "CANCELADA", "PENDIENTE"];

    if (invalidStatuses.includes(selectedTask.status)) {
      let messageText = "";
      switch (selectedTask.status) {
        case "PENDIENTE":
          messageText = "La tarea ya está pendiente.";
          break;
        case "COMPLETADA":
          messageText = "No se puede poner pendiente una tarea completada.";
          break;
        case "CANCELADA":
          messageText = "No se puede poner pendiente una tarea cancelada.";
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
        text: "Esta acción marcará la tarea como pendiente",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Poner Pendiente",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
          cancelButton: "swal-custom-button-cancel",
        },
      });
      if (result.isConfirmed) {
        await pendingTask(selectedTask.id);
        loadProjects();
        await refreshLogs();
        Swal.fire({
          title: "Pendiente!",
          text: "La tarea ha sido puesta en pendiente con exito.",
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

  const handleInReviewTask = async () => {
    if (!selectedTask) {
      await Swal.fire({
        title: "Error",
        text: "La tarea no se encuentra",
        icon: "error",
        confirmButtonText: "Aceptar",
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
        },
      });
      return;
    }

    const invalidStatuses = ["COMPLETADA", "CANCELADA", "EN_REVISION"];

    if (invalidStatuses.includes(selectedTask.status)) {
      let messageText = "";
      switch (selectedTask.status) {
        case "EN_REVISION":
          messageText = "La tarea ya está en revisión.";
          break;
        case "COMPLETADA":
          messageText = "No se puede poner en revisión una tarea completada.";
          break;
        case "CANCELADA":
          messageText = "No se puede poner en revisión una tarea cancelada.";
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
        text: "Esta acción marcará la tarea como en revisión",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Poner en Revisión",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
          cancelButton: "swal-custom-button-cancel",
        },
      });
      if (result.isConfirmed) {
        await reviewTask(selectedTask.id);
        loadProjects();
        await refreshLogs();
        Swal.fire({
          title: "En Revisión!",
          text: "La tarea ha sido puesta en revisión con exito.",
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

  const handlePriorityHigh = async () => {
    if (!selectedTask) {
      await Swal.fire({
        title: "Error",
        text: "La tarea no se encuentra",
        icon: "error",
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
        text: "Esta acción marcará la tarea con prioridad alta",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Marcar Prioridad Alta",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
          cancelButton: "swal-custom-button-cancel",
        },
      });
      if (result.isConfirmed) {
        await priorityHighTask(selectedTask.id);
        loadProjects();
        await refreshLogs();
        Swal.fire({
          title: "Prioridad Alta!",
          text: "La tarea ha sido marcada con prioridad alta con exito.",
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

  const handlePriorityLow = async () => {
    if (!selectedTask) {
      await Swal.fire({
        title: "Error",
        text: "La tarea no se encuentra",
        icon: "error",
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
        text: "Esta acción marcará la tarea con prioridad baja",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Marcar Prioridad Baja",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
          cancelButton: "swal-custom-button-cancel",
        },
      });
      if (result.isConfirmed) {
        await priorityLowTask(selectedTask.id);
        loadProjects();
        await refreshLogs();
        Swal.fire({
          title: "Prioridad Baja!",
          text: "La tarea ha sido marcada con prioridad baja con exito.",
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

  const handlePriorityMedium = async () => {
    if (!selectedTask) {
      await Swal.fire({
        title: "Error",
        text: "La tarea no se encuentra",
        icon: "error",
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
        text: "Esta acción marcará la tarea con prioridad media",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Marcar Prioridad Media",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
          cancelButton: "swal-custom-button-cancel",
        },
      });
      if (result.isConfirmed) {
        await priorityMediumTask(selectedTask.id);
        loadProjects();
        await refreshLogs();
        Swal.fire({
          title: "Prioridad Media!",
          text: "La tarea ha sido marcada con prioridad media con exito.",
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

  const handlePriorityUrgent = async () => {
    if (!selectedTask) {
      await Swal.fire({
        title: "Error",
        text: "La tarea no se encuentra",
        icon: "error",
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
        text: "Esta acción marcará la tarea con prioridad urgente",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Marcar Prioridad Urgente",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
          cancelButton: "swal-custom-button-cancel",
        },
      });
      if (result.isConfirmed) {
        await priorityUrgentTask(selectedTask.id);
        loadProjects();
        await refreshLogs();
        Swal.fire({
          title: "Prioridad Urgente!",
          text: "La tarea ha sido marcada con prioridad urgente con exito.",
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
    handleCompleteTask,
    handleInProgressTask,
    handleCancelTask,
    handlePendingTask,
    handleInReviewTask,
    handlePriorityHigh,
    handlePriorityLow,
    handlePriorityMedium,
    handlePriorityUrgent,
  };
};
