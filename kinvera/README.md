# Kinvera

Treinador pessoal inteligente com IA, ligado a smartwatch em tempo real.

## Estrutura

- `/backend` - Node.js API REST + SQLite
- `/frontend` - Flutter app (iOS/Android)
- `/database` - Seeds e migrations

## Backend

```bash
cd backend
npm install
npm run seed    # Dados de teste
npm run dev     # Servidor em http://localhost:3000
```

**Auth test:** `POST /api/auth/login` com `{ "email": "test@kinvera.com", "password": "password123" }`

## Frontend

```bash
cd frontend
flutter pub get
flutter run
```

## Fases

1. MVP - Base da app (Feito)
2. Backend completo (Feito)
3. Smartwatch integration (Simulado)
4. IA simples (Regras basicas)
5. Nutricao avancada
6. IA avancada

## API Endpoints

### Auth
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Perfil do utilizador

### Treinos
- `GET /api/workouts` - Listar treinos
- `POST /api/workouts` - Criar treino
- `GET /api/workouts/date/:date` - Treinos por data
- `PATCH /api/workouts/:uuid/complete` - Concluir treino

### Smartwatch (Simulado)
- `GET /api/watch-data/latest` - Dados mais recentes
- `GET /api/watch-data/history?days=7` - Historico
- `POST /api/watch-data` - Enviar dados

### Nutricao
- `GET /api/nutrition` - Refeicoes
- `POST /api/nutrition` - Adicionar refeicao
- `GET /api/nutrition/pre-workout` - Sugestoes pre-treino
- `GET /api/nutrition/post-workout` - Sugestoes pos-treino

### IA (Regras Simples)
- `GET /api/ai/workout-suggestion` - Sugestao de treino do dia
- `GET /api/ai/recovery` - Analise de recuperacao

### Utilizador
- `GET /api/users/stats` - Estatisticas
- `PUT /api/users/profile` - Atualizar perfil

## Teste Rapido

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@kinvera.com","password":"password123"}'

# Sugestao IA (usar token do login)
curl http://localhost:3000/api/ai/workout-suggestion \
  -H "Authorization: Bearer <TOKEN>"
```
