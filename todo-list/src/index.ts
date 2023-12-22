(() => {
  //criando tipos de notifications
  enum NotificationsPlatform {
    SMS = "SMS",
    EMAIL = "EMAIL",
    PUSH_NOTIFICATION = "PUSH_NOTIFICATION",
  }

  //criando o view mode que define o tipo de cadastro na tela: se todo ou se reminder
  enum ViewMode {
    TODO = "TODO",
    REMINDER = "REMINDER",
  }

  //criando interface generica para as tasks
  interface Task {
    id: string;
    dateCreated: Date;
    dateUpdated: Date;
    description: string;
    render(): string;
  }

  //função para criar um id aleatorio
  const UUID = (): string => {
    return Math.random().toString(32).substring(2, 9);
  };

  //função para formatar as datas
  const DateUtils = {
    tomorrow(): Date {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    },
    today(): Date {
      return new Date();
    },
    formatDate(date: Date): string {
      return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    },
  };

  class Reminder implements Task {
    id: string = UUID();
    dateCreated: Date = DateUtils.today();
    dateUpdated: Date = DateUtils.today();
    description: string = "";
    date: Date = DateUtils.tomorrow();
    notifications: Array<NotificationsPlatform> = [NotificationsPlatform.EMAIL];

    constructor(
      description: string,
      date: Date,
      notifications: Array<NotificationsPlatform>
    ) {
      (this.description = description),
        (this.date = date),
        (this.notifications = notifications);
    }

    render(): string {
      return `
        ---> Reminder <---
        description: ${this.description}
        date: ${DateUtils.formatDate(this.date)}
        platform: ${this.notifications.join(",")}
      `;
    }
  }
  class Todo implements Task {
    id: string = UUID();
    dateCreated: Date = DateUtils.today();
    dateUpdated: Date = DateUtils.today();
    description: string = "";
    done: boolean = false;

    constructor(description: string) {
      this.description = description;
    }

    render(): string {
      return `
        --->TODO<---
        description: ${this.description}
        done: ${this.done}
      `;
    }
  }

  const todo = new Todo("Criado com a classe TODO");
  const reminder = new Reminder("Criado com a classe reminder", new Date(), [
    NotificationsPlatform.EMAIL,
  ]);

  const taskView = {
    //criando a description do todo
    getTodo(form: HTMLFormElement): Todo {
      const todoDescription = form.todoDescription.value;
      form.reset();
      return new Todo(todoDescription);
    },
    getReminder(form: HTMLFormElement): Reminder {
      const reminderNotifications = [
        form.notification.value as NotificationsPlatform,
      ];
      const reminderDate = new Date(form.scheduleDate.value);
      const reminderDescription = form.reminderDescription.value;
      form.reset();
      return new Reminder(
        reminderDescription,
        reminderDate,
        reminderNotifications
      );
    },
    //renderizando as tasks na tela
    render(tasks: Array<Task>, mode: ViewMode) {
      const tasksList = document.getElementById("tasksList"); // recupera a lista  (UL) de tasks
      // limpando a lista de tarefas
      while (tasksList?.firstChild) {
        tasksList.removeChild(tasksList.firstChild);
      }

      // apresentando a lista na tela
      tasks.forEach((task) => {
        const li = document.createElement("LI");
        const textNode = document.createTextNode(task.render());
        li.appendChild(textNode);
        tasksList?.appendChild(li);
      });

      //editando os atributos de cada viewMode
      const todoSet = document.getElementById("todoSet");
      const reminderSet = document.getElementById("reminderSet");

      if (mode === ViewMode.TODO) {
        todoSet?.setAttribute("style", "display:block");
        todoSet?.removeAttribute("disabled");
        reminderSet?.setAttribute("style", "display: none");
        reminderSet?.setAttribute("disabled", "true");
      } else {
        reminderSet?.setAttribute("style", "display:block");
        reminderSet?.removeAttribute("disabled");
        todoSet?.setAttribute("style", "display: none");
        todoSet?.setAttribute("disabled", "true");
      }
    },
  };
  //criando controller para renderizar e armazenar as task
  const TaskController = (view: typeof taskView) => {
    const tasks: Array<Task> = []; //armazenando as tasks
    let mode: ViewMode = ViewMode.TODO; // estabelecendo o viewMode padrão como TODO

    //evento para previnir o efeito default do form e renderizar as tasks através do render
    const handleEvent = (event: Event) => {
      event.preventDefault();
      // adicionando as tasks no array tasks
      const form = event.target as HTMLFormElement;
      switch (mode as ViewMode) {
        case ViewMode.TODO:
          tasks.push(view.getTodo(form));
          break;
        case ViewMode.REMINDER:
          tasks.push(view.getReminder(form));
        default:
          break;
      }
      view.render(tasks, mode);
    };
    //criando togglemode do viewMode
    const handleToggleMode = () => {
      switch (mode as ViewMode) {
        case ViewMode.TODO:
          mode = ViewMode.REMINDER;
          break;
        case ViewMode.REMINDER:
          mode = ViewMode.TODO;
          break;
      }
      view.render(tasks, mode);
    };
    document
      .getElementById("toggleMode")
      ?.addEventListener("click", handleToggleMode);
    document
      .getElementById("taskForm")
      ?.addEventListener("submit", handleEvent);
  };

  TaskController(taskView);
})();
