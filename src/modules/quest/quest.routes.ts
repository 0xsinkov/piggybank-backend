import { Routes } from 'src/domain';

export const questRoutes: Routes = {
  controller: 'quest',
  tag: 'Quest',
  routes: {
    createQuest: 'create-quest',
    joinQuest: 'join-quest',
    getAllUserCreatedQuests: 'get-all-created-quests',
    getAllParticipatedUserQuests: 'get-all-participated-quests',
    getAllAvailableQuests: 'get-all-available-quests',
    getQuestById: 'get-quest-by-id/:questId',
  },
} as const;
