import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "../features/auth/useAuth";
import {
    getMyProfileRequest,
    updateAvatarRequest,
    updateBannerRequest,
    updateMyProfileRequest,
    type ProfileUser,
} from "../features/profiles/profile.api";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";
import { useNotifications } from "../features/notifications/NotificationProvider";
import { getPublicFileUrl } from "../lib/media";

export default function ProfilePage() {
    const { refreshMe } = useAuth();
    const { showToast } = useNotifications();

    const [profile, setProfile] = useState<ProfileUser | null>(null);
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        username: "",
        bio: "",
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    async function loadProfile() {
        try {
            setIsLoading(true);

            const data = await getMyProfileRequest();

            setProfile(data.user);
            setForm({
                firstName: data.user.firstName,
                lastName: data.user.lastName,
                username: data.user.username,
                bio: data.user.bio || "",
            });
        } catch (error: unknown) {
            showToast(getApiErrorMessage(error, "Erreur lors du chargement du profil"));
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void loadProfile();
    }, []);

    function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setForm((current) => ({
            ...current,
            [event.target.name]: event.target.value,
        }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        try {
            setIsSaving(true);

            const data = await updateMyProfileRequest({
                firstName: form.firstName,
                lastName: form.lastName,
                username: form.username,
                bio: form.bio,
            });

            setProfile(data.user);
            await refreshMe();
            showToast("Profil mis à jour");
        } catch (error: unknown) {
            showToast(getApiErrorMessage(error, "Erreur lors de la modification"));
        } finally {
            setIsSaving(false);
        }
    }

    async function handleAvatarChange(file?: File) {
        if (!file) return;

        try {
            await updateAvatarRequest(file);
            await loadProfile();
            await refreshMe();
            showToast("Avatar mis à jour");
        } catch (error: unknown) {
            showToast(getApiErrorMessage(error, "Erreur avatar"));
        }
    }

    async function handleBannerChange(file?: File) {
        if (!file) return;

        try {
            await updateBannerRequest(file);
            await loadProfile();
            showToast("Bannière mise à jour");
        } catch (error: unknown) {
            showToast(getApiErrorMessage(error, "Erreur bannière"));
        }
    }

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
                Chargement du profil...
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="rounded-2xl bg-red-500/15 p-6 text-red-300">
                Profil introuvable.
            </div>
        );
    }

    return (
        <section className="mx-auto max-w-4xl space-y-6">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-neutral-900">
                <div className="relative h-56 bg-gradient-to-br from-fuchsia-500/50 to-blue-500/30">
                    {profile.bannerUrl && (
                        <img
                            src={getPublicFileUrl(profile.bannerUrl)}
                            alt="Bannière"
                            className="h-full w-full object-cover"
                        />
                    )}

                    <label className="absolute right-4 top-4 cursor-pointer rounded-xl bg-black/60 px-4 py-2 text-sm font-semibold hover:bg-black/80">
                        Modifier la bannière
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) =>
                                void handleBannerChange(event.target.files?.[0])
                            }
                        />
                    </label>
                </div>

                <div className="relative px-6 pb-6">
                    <div className="-mt-16 flex items-end gap-4">
                        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-neutral-900 bg-fuchsia-500 text-4xl font-bold">
                            {profile.avatarUrl ? (
                                <img
                                    src={getPublicFileUrl(profile.avatarUrl)}
                                    alt="Avatar"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <>
                                    {profile.firstName[0]}
                                    {profile.lastName[0]}
                                </>
                            )}
                        </div>

                        <label className="mb-3 cursor-pointer rounded-xl bg-fuchsia-500 px-4 py-2 text-sm font-semibold hover:bg-fuchsia-600">
                            Modifier l’avatar
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(event) =>
                                    void handleAvatarChange(event.target.files?.[0])
                                }
                            />
                        </label>
                    </div>

                    <div className="mt-4">
                        <h1 className="text-3xl font-bold">
                            {profile.firstName} {profile.lastName}
                        </h1>
                        <p className="text-white/50">@{profile.username}</p>
                        <p className="mt-3 max-w-2xl text-white/75">
                            {profile.bio || "Aucune bio pour le moment."}
                        </p>
                    </div>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="rounded-3xl border border-white/10 bg-neutral-900 p-6"
            >
                <h2 className="mb-5 text-2xl font-bold">
                    Modifier mes informations
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm text-white/70">
                            Prénom
                        </label>
                        <input
                            name="firstName"
                            value={form.firstName}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-white/10 bg-neutral-800 px-4 py-3 outline-none focus:border-fuchsia-400"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm text-white/70">
                            Nom
                        </label>
                        <input
                            name="lastName"
                            value={form.lastName}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-white/10 bg-neutral-800 px-4 py-3 outline-none focus:border-fuchsia-400"
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <label className="mb-1 block text-sm text-white/70">
                        Username
                    </label>
                    <input
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-neutral-800 px-4 py-3 outline-none focus:border-fuchsia-400"
                    />
                </div>

                <div className="mt-4">
                    <label className="mb-1 block text-sm text-white/70">
                        Bio
                    </label>
                    <textarea
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        maxLength={500}
                        className="min-h-32 w-full rounded-xl border border-white/10 bg-neutral-800 px-4 py-3 outline-none focus:border-fuchsia-400"
                    />
                    <p className="mt-1 text-right text-xs text-white/40">
                        {form.bio.length}/500
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={isSaving}
                    className="mt-5 rounded-xl bg-fuchsia-500 px-5 py-3 font-semibold hover:bg-fuchsia-600 disabled:opacity-60"
                >
                    {isSaving ? "Enregistrement..." : "Enregistrer"}
                </button>
            </form>
        </section>
    );
}