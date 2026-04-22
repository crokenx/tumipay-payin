// PayIn Feature Barrel Export
export { usePayInStore } from './presentation/store/usePayInStore';

// Screens
export { CreatePayInScreen } from './presentation/screens/CreatePayInScreen';
export { PayInDetailScreen } from './presentation/screens/PayInDetailScreen';
export { PayInListScreen } from './presentation/screens/PayInListScreen';

// Components
export { PayInCard } from './presentation/components/PayInCard';
export { PayInStatusBadge } from './presentation/components/PayInStatusBadge';

// Domain
export { PayIn, PayInStatus, CreatePayInRequest, CreatePayInResponse } from './domain/entities/PayIn';
export type { IPayInRepository } from './domain/repositories/IPayInRepository';

// Use Cases
export { CreatePayInUseCase } from './application/useCases/createPayIn';
export { GetPayInByIdUseCase } from './application/useCases/getPayInById';
export { ListPayInsUseCase } from './application/useCases/listPayIns';

// Infrastructure
export { PayInApiAdapter } from './infrastructure/api/payInApiAdapter';
export { PayInMockAdapter } from './infrastructure/api/payInMockAdapter';
export { HttpClient, httpClient } from './infrastructure/http/httpClient';
