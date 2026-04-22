# Architecture Diagram

## Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Screens    │  │  Components  │  │     Store    │       │
│  │              │  │              │  │  (Zustand)   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│            ┌──────────────────────────────┐                  │
│            │      USE CASES                │                  │
│            │  • CreatePayIn                │                  │
│            │  • GetPayInById               │                  │
│            │  • ListPayIns                 │                  │
│            └──────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    DOMAIN LAYER                              │
│            ┌──────────────────────────────┐                  │
│            │  ENTITIES & REPOSITORIES      │                  │
│            │  • PayIn (Entity)             │                  │
│            │  • IPayInRepository (Contract)│                  │
│            └──────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
                            ↑
┌─────────────────────────────────────────────────────────────┐
│                INFRASTRUCTURE LAYER                          │
│  ┌────────────────┐              ┌────────────────┐         │
│  │  PayInApiAdapter│              │ PayInMockAdapter│        │
│  │  (Real API)    │              │ (Development)  │        │
│  └────────────────┘              └────────────────┘        │
│           ↓                              ↓                   │
│  ┌────────────────────────────────────────────┐             │
│  │         HttpClient (Axios)                 │             │
│  │  • Request/Response intercepts             │             │
│  │  • Auth token management                   │             │
│  │  • Timeout & error handling                │             │
│  └────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow: Create PayIn

```
User Input (Form)
       ↓
CreatePayInScreen (validates)
       ↓
usePayInStore.createPayIn()
       ↓
CreatePayInUseCase (business rules)
       ↓
IPayInRepository.createPayIn()
       ↓
PayInApiAdapter (implements interface)
       ↓
HttpClient.post()
       ↓
API Endpoint
```

## Data Flow: Display List

```
PayInListScreen mounts
       ↓
usePayInStore.listPayIns()
       ↓
ListPayInsUseCase
       ↓
IPayInRepository.listPayIns()
       ↓
PayInApiAdapter/PayInMockAdapter
       ↓
httpClient.get()
       ↓
Returns PayIn[] → setPayIns(data)
       ↓
Component re-renders with data
```

## State Management Flow

```
┌──────────────────┐
│   usePayInStore  │
├──────────────────┤
│ State:           │
│ • payins: []     │
│ • currentPayIn   │
│ • loading        │
│ • error          │
├──────────────────┤
│ Actions:         │
│ • createPayIn()  │
│ • getPayInById() │
│ • listPayIns()   │
│ • clearError()   │
└──────────────────┘
       ↑    ↓
       │    │
    Used by Components
    (Screens use hooks)
```

## Component Hierarchy

```
App
  └── AppNavigator
       └── NavigationContainer
            └── RootStack
                 └── MainTabs (BottomTabNavigator)
                      ├── ListTab
                      │    └── PayInNavigator
                      │         ├── PayInListScreen
                      │         │    └── PayInCard
                      │         │         └── PayInStatusBadge
                      │         └── PayInDetailScreen
                      │
                      └── CreateTab
                           └── CreatePayInScreen
                                └── Form Fields
                                └── LoadingOverlay
                                └── ErrorMessage
```

## Error Handling Strategy

```
┌─────────────────┐
│  Try API Call   │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Success? │
    └─┬──────┬─┘
      │No    │Yes
      ▼      ▼
   Handle  Update
   Error   State
      │
      ▼
   ┌────────────────┐
   │  Error Types:  │
   ├────────────────┤
   │ • Network      │
   │ • Validation   │
   │ • API Error    │
   │ • Unknown      │
   └────────────────┘
      │
      ▼
   ┌────────────────┐
   │  Show to User: │
   ├────────────────┤
   │ • Error Banner │
   │ • Field Errors │
   │ • Retry Button │
   └────────────────┘
```

## Technology Stack Diagram

```
┌──────────────────────────────────┐
│     React Native Application     │
│         (TypeScript)             │
└────────────────┬─────────────────┘
                 │
        ┌────────┼────────┐
        ▼        ▼        ▼
    ┌────┐  ┌───────┐  ┌──────────┐
    │Expo│  │React  │  │Zustand   │
    │    │  │Nav    │  │(State)   │
    └────┘  └───────┘  └──────────┘
        │
        ├──────────┬──────────┐
        ▼          ▼          ▼
    ┌───────┐ ┌────────┐ ┌─────────┐
    │ Axios │ │TypeScript│ │ESLint  │
    │(HTTP) │ │(Types)   │ │Prettier│
    └───────┘ └────────┘ └─────────┘
```

## API Integration Points

```
Frontend Application
        │
        ├─── HttpClient (Axios)
        │        │
        │        ├─── Request Interceptors
        │        │     • Add Auth Token
        │        │     • Set Headers
        │        │
        │        ├─── Response Interceptors
        │        │     • Log errors
        │        │     • Handle 401/403
        │        │
        │        └─── Error Handlers
        │              • Network errors
        │              • Timeout (10s)
        │              • HTTP status errors
        │
        └─── Backend API
             GET/POST /payins
             ├─── POST /payins (create)
             ├─── GET /payins/:id (detail)
             └─── GET /payins?customer_id=x (list)
```

## Deployment Architecture (Conceptual)

```
                    Developer
                        │
                        ▼
                ┌──────────────┐
                │   Git Repo   │ ← Push code
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │  CI/CD       │ ← Lint, Test, Build
                │  Pipeline    │
                └──────┬───────┘
                       │
            ┌──────────┼──────────┐
            ▼          ▼          ▼
        ┌────┐    ┌────────┐   ┌──────┐
        │APK │    │TestFlight│ │  IPA │
        │    │    │          │ │      │
        └────┘    └────────┘   └──────┘
            │          │          │
            ▼          ▼          ▼
        Google    Beta Users   App Store
        Play      (TestFlight)
```

---

This architecture ensures:
- **Testability**: Each layer can be tested independently
- **Maintainability**: Clear separation of concerns
- **Scalability**: Easy to add new features without modifying existing code
- **Flexibility**: Easy to swap implementations (API ↔ Mock)
- **Type Safety**: Full TypeScript coverage
