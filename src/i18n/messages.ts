import type { LocaleCode } from "@/types/common";

export const messages: Record<LocaleCode, Record<string, unknown>> = {
  ru: {
    app: {
      name: "Interviewer OS",
      subtitle: "Технические интервью"
    },
    nav: {
      home: "Главная",
      candidateAccess: "Вход кандидата",
      adminAccess: "Панель администратора",
      dashboard: "Обзор",
      candidates: "Кандидаты",
      sections: "Интервью",
      results: "Результаты",
      settings: "Настройки"
    },
    common: {
      loading: "Загрузка",
      save: "Сохранить",
      saving: "Сохранение",
      cancel: "Отмена",
      close: "Закрыть",
      back: "Назад",
      continue: "Продолжить",
      submit: "Отправить",
      start: "Начать",
      resume: "Продолжить",
      logout: "Выйти",
      copy: "Скопировать",
      copied: "Скопировано",
      export: "Выгрузить",
      preview: "Предпросмотр",
      create: "Создать",
      update: "Обновить",
      reset: "Сбросить",
      open: "Открыть",
      runTests: "Запустить тесты",
      saveDraft: "Сохранить черновик",
      nextTask: "Следующая задача",
      finishInterview: "Завершить интервью",
      startInterview: "Начать интервью",
      resumeInterview: "Вернуться к интервью",
      viewReport: "Открыть отчёт",
      viewCandidate: "Открыть карточку",
      createCandidate: "Создать кандидата",
      createInterview: "Создать интервью",
      createSection: "Создать интервью",
      openSection: "Открыть интервью",
      select: "Выбрать",
      all: "Все",
      candidate: "Кандидат",
      administrator: "Администратор",
      yes: "Да",
      no: "Нет",
      notAvailable: "—",
      day: "дн.",
      levels: {
        intern: "Стажёр",
        junior: "Junior",
        middle: "Middle",
        senior: "Senior",
        lead: "Lead"
      },
      difficulty: {
        easy: "Базовая",
        medium: "Средняя",
        hard: "Продвинутая"
      },
      domains: {
        algorithms: "Алгоритмы",
        algorithms_sql: "Алгоритмы + SQL"
      },
      sectionStatus: {
        draft: "Черновик",
        scheduled: "Запланирована",
        ready: "Готова к старту",
        in_progress: "В процессе",
        completed: "Завершена",
        expired: "Окно закрыто",
        revoked: "Отключена"
      },
      invitationStatus: {
        scheduled: "Ждёт открытия окна",
        available: "Доступна для старта",
        started: "Сессия начата",
        completed: "Сессия завершена",
        expired: "Ссылка истекла",
        revoked: "Ссылка отключена"
      },
      candidateStatus: {
        invited: "Приглашён",
        ready: "Ожидает старта",
        active: "В процессе",
        completed: "Завершил",
        paused: "Пауза"
      },
      risk: {
        low: "Низкий",
        medium: "Средний",
        high: "Высокий"
      },
      decision: {
        strong_yes: "Рекомендовать",
        yes: "Рекомендовать с оговорками",
        mixed: "Требует обсуждения",
        no: "Не рекомендовать"
      },
      placeholders: {
        search: "Поиск",
        selectCandidate: "Выберите кандидата",
        selectLanguage: "Выберите язык"
      },
      empty: {
        title: "Пока пусто",
        description: "Данные появятся после первого действия."
      }
    },
    errors: {
      UNKNOWN_ERROR: "Произошла непредвиденная ошибка.",
      INVALID_CANDIDATE_CREDENTIALS: "Неверные учётные данные кандидата.",
      INVALID_ADMIN_CREDENTIALS: "Неверный логин или пароль администратора.",
      DEMO_CANDIDATE_NOT_FOUND: "Тестовый кандидат не найден.",
      INVITATION_NOT_FOUND: "Приглашение не найдено.",
      INVITATION_NAME_MISMATCH: "Имя не совпадает с приглашением.",
      INVITATION_NOT_STARTED_YET: "Окно старта ещё не открылось.",
      INVITATION_EXPIRED: "Ссылка больше недействительна.",
      INVITATION_REVOKED: "Ссылка отключена администратором.",
      INVITATION_COMPLETED: "Интервью уже завершено.",
      INVITATION_RESUME_BLOCKED: "Сессию больше нельзя продолжить.",
      SECTION_NOT_FOUND: "Интервью не найдено.",
      CANDIDATE_NOT_FOUND: "Кандидат не найден.",
      RESULT_NOT_FOUND: "Результаты интервью не найдены.",
      REPORT_NOT_FOUND: "Отчёт ещё не сформирован.",
      SECTION_ALREADY_COMPLETED: "Интервью уже завершено.",
      NO_NEXT_TASK: "Следующая задача пока не определена.",
      NAME_REQUIRED: "Введите имя кандидата.",
      LEVEL_REQUIRED: "Выберите уровень перед стартом.",
      CANDIDATE_REQUIRED: "Нужно выбрать кандидата.",
      WINDOW_REQUIRED: "Нужно задать окно старта.",
      ROLE_REQUIRED: "Укажите направление интервью.",
      TITLE_REQUIRED: "Введите название интервью."
    },
    public: {
      home: {
        eyebrow: "Платформа технических интервью",
        title: "Платформа для технических собеседований",
        description:
          "Единая платформа для проведения технических интервью.",
        candidateAction: "Вход кандидата",
        adminAction: "Панель администратора"
      },
      candidateAccess: {
        title: "Вход кандидата",
        description:
          "Вставьте ссылку или ключ доступа, полученные от администратора.",
        keyLabel: "Ссылка или ключ доступа",
        keyPlaceholder: "Например: https://app.local/invite/INV-ABCD или INV-ABCD",
        keyHelper:
          "После проверки вы увидите срок действия доступа и параметры интервью.",
        keyStateIdle: "Вставьте ссылку, полученную от администратора.",
        keyStateLoading: "Проверяем доступ…",
        keyStateReady: "Приглашение найдено. Можно продолжить.",
        keyStateError: "Проверьте ссылку или запросите новую у администратора.",
        sectionPreview: "Параметры приглашения",
        remainingLabel: "Доступ по ссылке действует ещё",
        startWindowLabel: "Окно старта",
        durationLabel: "Длительность сессии",
        domainLabel: "Предметная область",
        trackLabel: "Интервью",
        continueAction: "Продолжить",
        instructionsTitle: "Перед началом",
        instructionsBody:
          "После проверки доступа вы выберете свой уровень и только затем запустите таймер интервью."
      },
      adminAccess: {
        title: "Вход администратора",
        description: "Введите логин и пароль для доступа к панели управления.",
        loginLabel: "Логин",
        passwordLabel: "Пароль",
        submit: "Войти"
      },
      invitation: {
        title: "Доступ к интервью",
        description:
          "Проверьте параметры доступа и перейдите к старту интервью.",
        metaTitle: "Параметры интервью",
        candidateNameLabel: "Участник",
        nameHelper: "Данные участника уже заданы администратором.",
        confirm: "Подтвердить и продолжить",
        sessionDuration: "Длительность сессии",
        startWindow: "Окно старта",
        accessDeadline: "Доступ по ссылке до",
        sectionDomain: "Предметная область",
        sectionRole: "Интервью",
        stateTitle: "Состояние доступа",
        canStart: "Интервью доступно для старта.",
        canResume: "Сессия уже запущена. После входа вы вернётесь к текущей задаче.",
        scheduled: "Окно старта ещё не открылось.",
        expired: "Срок действия ссылки истёк.",
        completed: "Интервью завершено. Ссылка деактивирована.",
        revoked: "Ссылка отключена администратором.",
        currentSession: "Текущая сессия",
        startedAt: "Начата",
        endsAt: "Автозавершение",
        successTitle: "Доступ подтверждён",
        successBody: "Можно перейти к подготовке интервью.",
        openWorkspace: "Перейти в рабочее пространство"
      }
    },
    candidate: {
      home: {
        title: "Рабочее пространство кандидата",
        description:
          "Параметры интервью, старт и возврат в уже начатую сессию.",
        sectionCardTitle: "Текущее интервью",
        noSectionTitle: "Нет активного интервью",
        noSectionBody: "Когда администратор создаст интервью или вы откроете приглашение, оно появится здесь.",
        selfAssessmentTitle: "\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u0432\u0430\u0448 \u0443\u0440\u043e\u0432\u0435\u043d\u044c",
        selfAssessmentBody:
          "Выберите уровень перед стартом. Первый вопрос остаётся средней сложности, а дальнейшая траектория подстраивается под темп и качество решения.",
        interviewInfoTitle: "Формат интервью",
        interviewInfoBody:
          "Одна активная задача, таймер, редактор кода и панель видимых проверок.",
        readyToStart: "Интервью ещё не начато",
        readyToResume: "Интервью уже начато и доступно для продолжения",
        completedTitle: "Интервью завершено",
        completedBody: "Результаты сохранены и ожидают проверки администратором.",
        openWindow: "Окно для старта",
        chosenLevel: "Выбранный уровень",
        timeLimit: "Лимит по времени",
        languages: "Языки программирования",
        progress: "Прогресс по задачам"
      },
      workspace: {
        title: "Техническое интервью",
        description:
          "Фокусный режим: одна активная задача, редактор кода по центру и компактные панели с условиями, тестами и статусами.",
        timer: "Осталось времени",
        taskLabel: "Текущая задача",
        taskSequence: "Траектория интервью",
        visibleTests: "Видимые тесты",
        hiddenTests: "Скрытые тесты",
        runResult: "Результат прогона",
        taskReady: "Задача готова к переходу",
        taskReadyBody: "Видимые тесты пройдены. Следующая задача будет определена на основе текущего результата.",
        taskPendingBody: "Нужно ещё немного допроверить решение и добрать тесты.",
        antiCheatTitle: "Системные сигналы",
        antiCheatBody: "Платформа фиксирует вставки, переключения фокуса и подозрительную активность браузера.",
        notesTitle: "Ограничения",
        adaptiveTitle: "Как работает адаптация",
        adaptiveBody:
          "Стартовая задача средней сложности. Дальше система повышает, удерживает или снижает уровень в зависимости от скорости, количества попыток и качества прохождения тестов.",
        autoFinishWarning: "Если таймер закончится, интервью завершится автоматически.",
        completeTitle: "Интервью завершено",
        completeBody: "Ответы сохранены. Подробные результаты доступны только администратору.",
        leaveTitle: "Вернуться позже",
        leaveBody: "Если интервью уже начато, вы сможете продолжить его до конца лимита времени."
      },
      complete: {
        title: "Интервью завершено",
        description:
          "Работа сохранена. Детальный отчёт, баллы и рекомендации доступны только администратору после проверки.",
        summaryTitle: "Что дальше",
        summaryBody:
          "Можно закрыть страницу. Если открыть то же приглашение снова, вы увидите статус интервью, но не внутренние оценки.",
        backHome: "Вернуться в кабинет"
      }
    },
    admin: {
      dashboard: {
        title: "Панель управления интервью",
        totalCandidates: "Кандидаты",
        activeSections: "Активные интервью",
        completionRate: "Доля завершений",
        riskAlerts: "Сигналы риска",
        latestCandidates: "Последние кандидаты",
        expiringSections: "Ближайшие окна старта",
        activeSessions: "Сессии в работе"
      },
      candidates: {
        title: "Кандидаты",
        description:
          "Список кандидатов, текущий статус, средний балл и быстрый переход в карточку.",
        searchLabel: "Поиск по имени или email",
        emptyTitle: "Кандидатов пока нет",
        emptyBody: "Создайте первое интервью и отправьте ссылку участнику."
      },
      candidateDetail: {
        title: "Карточка кандидата",
        about: "Профиль кандидата",
        currentSections: "Будущие и активные интервью",
        completedSections: "Завершённые интервью",
        notes: "Заметки",
        score: "Средний балл",
        antiCheat: "Риск",
        createSection: "Создать новое интервью",
        openInvite: "Открыть приглашение",
        noCompleted: "У участника пока нет завершённых интервью."
      },
      createCandidate: {
        title: "Создание кандидата",
        description:
          "Минимальная карточка для дальнейшей работы: профиль, направление и заметки для интервьюера.",
        fullName: "Полное имя",
        email: "Email",
        targetRole: "Позиция",
        targetLevel: "Целевой уровень",
        preferredDomain: "Ключевая область",
        timezone: "Часовой пояс",
        notes: "Заметки",
        submit: "Создать кандидата"
      },
      createSection: {
        title: "Создание интервью",
        description:
          "Окно старта и таймер сессии задаются отдельно: кандидат может начать в указанном интервале, а таймер пойдёт только после нажатия кнопки старта.",
        titleLabel: "Название интервью",
        candidateLabel: "Кандидат",
        domainLabel: "Предметная область",
        roleLabel: "Название интервью",
        durationLabel: "Длительность сессии, мин",
        windowModeLabel: "Режим окна старта",
        relativeMode: "От текущего момента на N дней",
        fixedMode: "Фиксированный диапазон дат",
        windowDaysLabel: "Количество дней для старта",
        opensAtLabel: "Открывается",
        closesAtLabel: "Закрывается",
        languagesLabel: "Разрешённые языки",
        instructionsLabel: "Инструкции для кандидата",
        introLabel: "Короткое описание интервью",
        previewTitle: "Что получит кандидат",
        previewBody:
          "Кандидат увидит предметную область, окно старта, лимит времени, выбор уровня и только одну активную задачу за раз.",
        submit: "Создать интервью и ссылку"
      },
      sections: {
        title: "Интервью",
        description:
          "Управление окнами старта, ссылками-приглашениями и текущим состоянием интервью.",
        startWindow: "Окно старта",
        invitation: "Ссылка",
        sessionState: "Состояние",
        deactivate: "Отключить ссылку",
        reactivate: "Включить ссылку"
      },
      results: {
        title: "Результаты",
        description:
          "Итоговые оценки, риск и решение по каждому интервью.",
        score: "Итоговый балл",
        decision: "Решение",
        viewReport: "Открыть отчёт"
      },
      report: {
        title: "Отчёт по интервью",
        description:
          "Подробная сводка с сильными и слабыми сторонами, breakdown по критериям и античит-сигналами.",
        summary: "Краткое резюме",
        strengths: "Сильные стороны",
        weaknesses: "Зоны роста",
        recommendations: "Рекомендации",
        antiCheat: "Anti-cheat",
        nextSteps: "Следующие шаги",
        export: "Выгрузить отчёт"
      },
      settings: {
        title: "Настройки сценария интервью",
        description:
          "Вес критериев, модули античита и параметры адаптивной логики. Здесь же лежит обзор банка задач.",
        supportedLanguages: "Поддерживаемые языки",
        weights: "Веса оценки",
        antiCheatModules: "Модули античита",
        adaptivePolicy: "Правила адаптации",
        taskBank: "Банк задач",
        resetData: "Сбросить demo-данные"
      }
    },
    notFound: {
      title: "Страница не найдена",
      description: "Проверьте адрес или вернитесь на главную страницу.",
      action: "На главную"
    },
    toast: {
      inviteCopied: "Ссылка приглашения скопирована",
      candidateCreated: "Кандидат создан",
      sectionCreated: "Интервью создано",
      draftSaved: "Черновик сохранён",
      settingsSaved: "Настройки обновлены",
      linkRevoked: "Ссылка отключена",
      linkReopened: "Ссылка снова активна"
    }
  },
  en: {
    app: {
      name: "Interviewer OS",
      subtitle: "Technical interviews"
    },
    nav: {
      home: "Home",
      candidateAccess: "Candidate access",
      adminAccess: "Admin panel",
      dashboard: "Overview",
      candidates: "Candidates",
      sections: "Interviews",
      results: "Results",
      settings: "Settings"
    },
    common: {
      loading: "Loading",
      save: "Save",
      saving: "Saving",
      cancel: "Cancel",
      close: "Close",
      back: "Back",
      continue: "Continue",
      submit: "Submit",
      start: "Start",
      resume: "Resume",
      logout: "Sign out",
      copy: "Copy",
      copied: "Copied",
      export: "Export",
      preview: "Preview",
      create: "Create",
      update: "Update",
      reset: "Reset",
      open: "Open",
      runTests: "Run tests",
      saveDraft: "Save draft",
      nextTask: "Next task",
      finishInterview: "Finish interview",
      startInterview: "Start interview",
      resumeInterview: "Resume interview",
      viewReport: "Open report",
      viewCandidate: "Open profile",
      createCandidate: "Create candidate",
      createInterview: "Create interview",
      createSection: "Create interview",
      openSection: "Open interview",
      select: "Select",
      all: "All",
      candidate: "Candidate",
      administrator: "Administrator",
      yes: "Yes",
      no: "No",
      notAvailable: "—",
      day: "days",
      levels: {
        intern: "Intern",
        junior: "Junior",
        middle: "Mid-level",
        senior: "Senior",
        lead: "Lead"
      },
      difficulty: {
        easy: "Foundational",
        medium: "Core",
        hard: "Advanced"
      },
      domains: {
        algorithms: "Algorithms",
        algorithms_sql: "Algorithms + SQL"
      },
      sectionStatus: {
        draft: "Draft",
        scheduled: "Scheduled",
        ready: "Ready to start",
        in_progress: "In progress",
        completed: "Completed",
        expired: "Window expired",
        revoked: "Disabled"
      },
      invitationStatus: {
        scheduled: "Waiting for start window",
        available: "Ready to start",
        started: "Session started",
        completed: "Session completed",
        expired: "Link expired",
        revoked: "Link disabled"
      },
      candidateStatus: {
        invited: "Invited",
        ready: "Awaiting start",
        active: "Active",
        completed: "Completed",
        paused: "Paused"
      },
      risk: {
        low: "Low",
        medium: "Medium",
        high: "High"
      },
      decision: {
        strong_yes: "Recommend",
        yes: "Recommend with notes",
        mixed: "Needs discussion",
        no: "Do not recommend"
      },
      placeholders: {
        search: "Search",
        selectCandidate: "Select candidate",
        selectLanguage: "Select language"
      },
      empty: {
        title: "Nothing here yet",
        description: "Data will appear after the first action."
      }
    },
    errors: {
      UNKNOWN_ERROR: "Something went wrong.",
      INVALID_CANDIDATE_CREDENTIALS: "Invalid candidate credentials.",
      INVALID_ADMIN_CREDENTIALS: "Invalid administrator credentials.",
      DEMO_CANDIDATE_NOT_FOUND: "The test candidate was not found.",
      INVITATION_NOT_FOUND: "Invitation was not found.",
      INVITATION_NAME_MISMATCH: "Candidate name does not match the invitation.",
      INVITATION_NOT_STARTED_YET: "The start window is not open yet.",
      INVITATION_EXPIRED: "The link is no longer active.",
      INVITATION_REVOKED: "The link was disabled by an administrator.",
      INVITATION_COMPLETED: "The interview has already been completed.",
      INVITATION_RESUME_BLOCKED: "This session can no longer be resumed.",
      SECTION_NOT_FOUND: "Interview was not found.",
      CANDIDATE_NOT_FOUND: "Candidate was not found.",
      RESULT_NOT_FOUND: "Interview results were not found.",
      REPORT_NOT_FOUND: "The report has not been generated yet.",
      SECTION_ALREADY_COMPLETED: "The interview has already been completed.",
      NO_NEXT_TASK: "The next task is not available yet.",
      NAME_REQUIRED: "Enter the candidate name.",
      LEVEL_REQUIRED: "Select the level before starting.",
      CANDIDATE_REQUIRED: "A candidate must be selected.",
      WINDOW_REQUIRED: "Configure the start window.",
      ROLE_REQUIRED: "Specify the interview track.",
      TITLE_REQUIRED: "Enter an interview title."
    },
    public: {
      home: {
        eyebrow: "Technical interview platform",
        title: "Platform for technical interviews",
        description:
          "A focused workspace for candidates and an admin panel for access and reporting.",
        candidateAction: "Candidate access",
        adminAction: "Admin panel"
      },
      candidateAccess: {
        title: "Candidate access",
        description:
          "Paste the personal link or access key to validate the invitation and continue to confirmation.",
        keyLabel: "Invitation link or access key",
        keyPlaceholder: "Example: https://app.local/invite/INV-ABCD or INV-ABCD",
        keyHelper: "After validation you will see the interview details and access lifetime.",
        keyStateIdle: "Paste the link received from the administrator.",
        keyStateLoading: "Checking access…",
        keyStateReady: "Invitation found. You can continue.",
        keyStateError: "Check the link or request a new one from the administrator.",
        sectionPreview: "Invitation details",
        remainingLabel: "Link remains active for",
        startWindowLabel: "Start window",
        durationLabel: "Session duration",
        domainLabel: "Domain",
        trackLabel: "Track",
        continueAction: "Continue",
        instructionsTitle: "Before you start",
        instructionsBody:
          "After confirming your name, you will choose your level and only then start the session timer."
      },
      adminAccess: {
        title: "Administrator sign in",
        description: "Enter your login and password to access the operations panel.",
        loginLabel: "Login",
        passwordLabel: "Password",
        submit: "Sign in"
      },
      invitation: {
        title: "Access confirmation",
        description:
          "Review the access details and continue to the candidate workspace.",
        metaTitle: "Interview details",
        candidateNameLabel: "Candidate name",
        nameHelper: "Participant details are already assigned by the administrator.",
        confirm: "Confirm and continue",
        sessionDuration: "Session duration",
        startWindow: "Start window",
        accessDeadline: "Link access until",
        sectionDomain: "Domain",
        sectionRole: "Interview track",
        stateTitle: "Access status",
        canStart: "The interview is ready to start.",
        canResume: "The session is already running. After sign-in you will return to the current task.",
        scheduled: "The start window is not open yet.",
        expired: "The link has expired.",
        completed: "The interview is completed and the link has been deactivated.",
        revoked: "The link was disabled by an administrator.",
        currentSession: "Current session",
        startedAt: "Started at",
        endsAt: "Auto-finish",
        successTitle: "Access confirmed",
        successBody: "You can continue to interview setup.",
        openWorkspace: "Go to workspace"
      }
    },
    candidate: {
      home: {
        title: "Candidate workspace",
        description:
          "Interview parameters, start controls and resume access.",
        sectionCardTitle: "Current interview",
        noSectionTitle: "No active interview",
        noSectionBody:
          "Once an administrator creates an interview or you open an invitation, it will appear here.",
        selfAssessmentTitle: "Select your level",
        selfAssessmentBody:
          "Select your level before the start. The first task remains medium difficulty, while the next steps adapt to your pace and solution quality.",
        interviewInfoTitle: "Interview format",
        interviewInfoBody:
          "One active task, a timer, a code editor and a panel with visible checks.",
        readyToStart: "The interview has not started yet",
        readyToResume: "The interview has already started and can be resumed",
        completedTitle: "Interview completed",
        completedBody: "Your work has been stored and is waiting for administrative review.",
        openWindow: "Start window",
        chosenLevel: "Selected level",
        timeLimit: "Time limit",
        languages: "Supported languages",
        progress: "Task progress"
      },
      workspace: {
        title: "Technical interview",
        description:
          "A focused layout: one active task, a central editor, and compact side panels for constraints, tests and system status.",
        timer: "Time remaining",
        taskLabel: "Current task",
        taskSequence: "Interview path",
        visibleTests: "Visible tests",
        hiddenTests: "Hidden tests",
        runResult: "Run result",
        taskReady: "Task ready for the next step",
        taskReadyBody:
          "Visible tests are green. The next task will be selected based on the current outcome.",
        taskPendingBody: "A bit more verification is needed before the next step.",
        antiCheatTitle: "System signals",
        antiCheatBody:
          "The platform tracks paste events, focus changes and suspicious browser activity.",
        notesTitle: "Constraints",
        adaptiveTitle: "How adaptation works",
        adaptiveBody:
          "The session starts with a medium task. The system then raises, holds or lowers the level based on speed, number of attempts and test quality.",
        autoFinishWarning: "The interview will finish automatically when the timer reaches zero.",
        completeTitle: "Interview completed",
        completeBody: "Your answers have been saved. Detailed results are available to administrators only.",
        leaveTitle: "Resume later",
        leaveBody:
          "Once the interview has started, you may re-enter and continue until the session time limit ends."
      },
      complete: {
        title: "Interview completed",
        description:
          "Your work has been stored. Detailed scoring and recommendations are visible only to administrators after review.",
        summaryTitle: "What happens next",
        summaryBody:
          "You may close the page. If you open the same invitation again, you will see the interview status but not the internal evaluation.",
        backHome: "Back to workspace"
      }
    },
    admin: {
      dashboard: {
        title: "Interview operations",
        description:
          "Key metrics, soon-to-expire invitations and active sessions without presentation-heavy clutter.",
        totalCandidates: "Candidates",
        activeSections: "Active interviews",
        completionRate: "Completion rate",
        riskAlerts: "Risk alerts",
        latestCandidates: "Recent candidates",
        expiringSections: "Upcoming start windows",
        activeSessions: "Sessions in progress"
      },
      candidates: {
        title: "Candidates",
        description:
          "A clean working list with current status, average score and a direct link to the profile.",
        searchLabel: "Search by name or email",
        emptyTitle: "No candidates yet",
        emptyBody: "Create the first interview and send the link to a participant."
      },
      candidateDetail: {
        title: "Candidate profile",
        about: "Candidate profile",
        currentSections: "Upcoming and active interviews",
        completedSections: "Completed interviews",
        notes: "Notes",
        score: "Average score",
        antiCheat: "Risk",
        createSection: "Create new interview",
        openInvite: "Open invitation",
        noCompleted: "This participant has no completed interviews yet."
      },
      createCandidate: {
        title: "Create candidate",
        description:
          "A compact profile for the operational flow: role, target level and notes for the interviewer.",
        fullName: "Full name",
        email: "Email",
        targetRole: "Role",
        targetLevel: "Target level",
        preferredDomain: "Primary domain",
        timezone: "Time zone",
        notes: "Notes",
        submit: "Create candidate"
      },
      createSection: {
        title: "Create interview",
        description:
          "The start window and the interview timer are configured separately: the candidate may start within the window, while the actual timer starts only after the start button is pressed.",
        titleLabel: "Interview title",
        candidateLabel: "Candidate",
        domainLabel: "Domain",
        roleLabel: "Interview track",
        durationLabel: "Session duration, min",
        windowModeLabel: "Start window mode",
        relativeMode: "Relative window from now",
        fixedMode: "Fixed date range",
        windowDaysLabel: "Days available to start",
        opensAtLabel: "Opens at",
        closesAtLabel: "Closes at",
        languagesLabel: "Allowed languages",
        instructionsLabel: "Candidate instructions",
        introLabel: "Interview summary",
        previewTitle: "Candidate-facing preview",
        previewBody:
          "The candidate sees the domain, start window, time limit, self-assessed level and one active task at a time.",
        submit: "Create interview and invitation"
      },
      sections: {
        title: "Interviews",
        description:
          "Manage start windows, invitation links and the current state of every interview.",
        startWindow: "Start window",
        invitation: "Invitation",
        sessionState: "State",
        deactivate: "Disable link",
        reactivate: "Re-open link"
      },
      results: {
        title: "Results",
        description:
          "Administrative visibility only: final scores, anti-cheat risk and the outcome decision.",
        score: "Score",
        decision: "Decision",
        viewReport: "Open report"
      },
      report: {
        title: "Interview report",
        description:
          "A detailed summary with strengths, weaknesses, score breakdown and anti-cheat notes.",
        summary: "Summary",
        strengths: "Strengths",
        weaknesses: "Growth areas",
        recommendations: "Recommendations",
        antiCheat: "Anti-cheat",
        nextSteps: "Next steps",
        export: "Export report"
      },
      settings: {
        title: "Interview scenario settings",
        description:
          "Scoring weights, anti-cheat modules and adaptive rules, plus an overview of the task bank.",
        supportedLanguages: "Supported languages",
        weights: "Score weights",
        antiCheatModules: "Anti-cheat modules",
        adaptivePolicy: "Adaptive rules",
        taskBank: "Task bank",
        resetData: "Reset demo data"
      }
    },
    notFound: {
      title: "Page not found",
      description: "Check the URL or go back to the home page.",
      action: "Go home"
    },
    toast: {
      inviteCopied: "Invitation link copied",
      candidateCreated: "Candidate created",
      sectionCreated: "Interview created",
      draftSaved: "Draft saved",
      settingsSaved: "Settings updated",
      linkRevoked: "Link disabled",
      linkReopened: "Link reopened"
    }
  }
};
