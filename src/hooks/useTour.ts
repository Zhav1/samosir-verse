import { useAppStore } from '@/store/useAppStore';

export const useTour = () => {
    const { currentNodeId, setCurrentNode } = useAppStore();
    return { currentNodeId, setCurrentNode };
};
