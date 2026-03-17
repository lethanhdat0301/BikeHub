const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3300";

interface ChatIdentity {
    id: number;
    name: string;
}

const CHAT_GUEST_KEY_STORAGE = "chat_guest_key";

const getOrCreateGuestKey = () => {
    const existing = localStorage.getItem(CHAT_GUEST_KEY_STORAGE);
    if (existing) {
        return existing;
    }

    const newKey = `guest_${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(CHAT_GUEST_KEY_STORAGE, newKey);
    return newKey;
};

export const getChatIdentity = async (): Promise<ChatIdentity> => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (storedUser?.id) {
        return {
            id: Number(storedUser.id),
            name: storedUser.name || "User",
        };
    }

    const guestKey = getOrCreateGuestKey();
    const response = await fetch(`${API_URL}/api/chat/public/guest-session`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            guestKey,
            name: "Guest",
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to initialize guest chat session");
    }

    const data = await response.json();
    return {
        id: Number(data.userId),
        name: data.userName || "Guest",
    };
};
