import { useEffect, useState, useRef, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Save } from "lucide-react";
import { useAuth } from "../features/auth/useAuth";
import { updateMyProfileRequest, deleteMyAccountRequest } from "../features/profiles/profile.api";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";
import { getPublicFileUrl } from "../lib/media";
import { useNotifications } from "../features/notifications/NotificationProvider";
import { Trash2 } from "lucide-react";

function getInitials(firstName?: string, lastName?: string) {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
}

export default function ProfileSettingsPage() {
    const { user, isLoading, refreshMe, logout } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useNotifications();

    const [form, setForm] = useState(() => ({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        username: user?.username || "",
        bio: user?.bio || "",
    }));

    const [avatar, setAvatar] = useState<File | null>(null);
    const [banner, setBanner] = useState<File | null>(null);

    const [avatarPreview, setAvatarPreview] = useState<string | null>(() =>
        user?.avatarUrl ? getPublicFileUrl(user.avatarUrl) : null
    );

    const [bannerPreview, setBannerPreview] = useState<string | null>(() =>
        user?.bannerUrl ? getPublicFileUrl(user.bannerUrl) : null
    );

    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const avatarInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        return () => {
            if (avatarPreview?.startsWith("blob:")) {
                URL.revokeObjectURL(avatarPreview);
            }

            if (bannerPreview?.startsWith("blob:")) {
                URL.revokeObjectURL(bannerPreview);
            }
        };
    }, [avatarPreview, bannerPreview]);

    function handleChange(
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        setForm((current) => ({
            ...current,
            [event.target.name]: event.target.value,
        }));
    }

    function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("L'avatar doit être une image.");
            return;
        }

        if (avatarPreview?.startsWith("blob:")) {
            URL.revokeObjectURL(avatarPreview);
        }

        setError("");
        setAvatar(file);
        setAvatarPreview(URL.createObjectURL(file));
    }

    function handleBannerChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("La bannière doit être une image.");
            return;
        }

        if (bannerPreview?.startsWith("blob:")) {
            URL.revokeObjectURL(bannerPreview);
        }

        setError("");
        setBanner(file);
        setBannerPreview(URL.createObjectURL(file));
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!form.firstName.trim()) {
            setError("Le prénom est requis.");
            return;
        }

        if (!form.lastName.trim()) {
            setError("Le nom est requis.");
            return;
        }

        if (!form.username.trim()) {
            setError("Le username est requis.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError("");

            const data = await updateMyProfileRequest({
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                username: form.username.trim(),
                bio: form.bio.trim(),
                avatar,
                banner,
            });

            await refreshMe();

            showToast(data.message || "Profil mis à jour");
            navigate(`/profile/${data.user.username}`);
        } catch (err: unknown) {
            setError(
                getApiErrorMessage(
                    err,
                    "Erreur lors de la mise à jour du profil"
                )
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDeleteAccount() {
        const confirmed = window.confirm(
            "Cette action est définitive. Supprimer ton compte ?"
        );

        if (!confirmed) return;

        try {
            setIsSubmitting(true);
            await deleteMyAccountRequest();
            logout();
            navigate("/register");
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, "Impossible de supprimer le compte"));
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <div className="rounded-3xl border border-white/10 bg-neutral-900 p-8">
                Chargement des paramètres...
            </div>
        );
    }

    if (!user) {
        return (
            <div className="rounded-3xl border border-white/10 bg-neutral-900 p-8">
                Utilisateur introuvable.
            </div>
        );
    }

    return (
        <section className="mx-auto max-w-4xl space-y-6">
            <div>
                <Link
                    to={`/profile/${user.username}`}
                    className="text-sm text-fuchsia-300 hover:underline"
                >
                    ← Retour au profil
                </Link>

                <h1 className="mt-4 text-4xl font-black">
                    Paramètres du profil
                </h1>

                <p className="mt-2 text-white/60">
                    Modifie tes informations publiques et tes images de profil.
                </p>
            </div>

            {error && (
                <div className="rounded-2xl bg-red-500/15 p-4 text-red-300">
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="overflow-hidden rounded-[32px] border border-white/10 bg-neutral-900"
            >
                <div className="relative h-56 bg-neutral-800">
                    {bannerPreview && (
                        <img
                            src={bannerPreview}
                            alt="Bannière"
                            className="h-full w-full object-cover"
                        />
                    )}

                    <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/60 to-transparent"/>

                    <label
                        className="absolute bottom-4 right-4 z-20 inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-bold text-neutral-900 shadow-lg transition hover:bg-neutral-100 dark:border-white/10 dark:bg-black/70 dark:text-white dark:hover:bg-black/90"
                    >
                        <Camera className="h-4 w-4"/>
                        Changer la bannière

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleBannerChange}
                            className="absolute inset-0 cursor-pointer opacity-0"
                        />
                    </label>
                </div>
                <div className="relative px-8 pb-8">
                    <div className="-mt-16">
                        <div className="relative h-32 w-32">
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt="Avatar"
                                    className="h-32 w-32 rounded-full border-4 border-neutral-900 object-cover"
                                />
                            ) : (
                                <div
                                    className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-neutral-900 bg-fuchsia-500 text-4xl font-black">
                                    {getInitials(user.firstName, user.lastName)}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => avatarInputRef.current?.click()}
                                className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full bg-fuchsia-500 hover:bg-fuchsia-600"
                            >
                                <Camera className="h-5 w-5"/>
                            </button>

                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </div>
                    </div>

                    <div className="mt-8 grid gap-5 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm text-white/60">
                                Prénom
                            </label>

                            <input
                                name="firstName"
                                value={form.firstName}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-white/10 bg-neutral-800 px-4 py-3 outline-none focus:border-fuchsia-400"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm text-white/60">
                                Nom
                            </label>

                            <input
                                name="lastName"
                                value={form.lastName}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-white/10 bg-neutral-800 px-4 py-3 outline-none focus:border-fuchsia-400"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm text-white/60">
                                Username
                            </label>

                            <input
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-white/10 bg-neutral-800 px-4 py-3 outline-none focus:border-fuchsia-400"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm text-white/60">
                                Bio
                            </label>

                            <textarea
                                name="bio"
                                value={form.bio}
                                onChange={handleChange}
                                placeholder="Présente-toi en quelques mots..."
                                className="min-h-36 w-full resize-none rounded-2xl border border-white/10 bg-neutral-800 px-4 py-3 outline-none focus:border-fuchsia-400"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <Link
                            to={`/profile/${user.username}`}
                            className="rounded-2xl bg-white/10 px-6 py-3 font-bold hover:bg-white/20"
                        >
                            Annuler
                        </Link>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 rounded-2xl bg-fuchsia-500 px-6 py-3 font-bold hover:bg-fuchsia-600 disabled:opacity-60"
                        >
                            <Save className="h-4 w-4"/>
                            {isSubmitting
                                ? "Enregistrement..."
                                : "Enregistrer"}
                        </button>
                    </div>
                </div>
            </form>
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-neutral-900">
                <h2 className="text-xl font-bold text-red-700">
                    Supprimer mon compte
                </h2>

                <p className="mt-2 text-sm text-neutral-800">
                    La suppression du compte est définitive. Tes messages, posts,
                    salons créés, commentaires et données associées seront supprimés.
                </p>

                <button
                    type="button"
                    onClick={() => void handleDeleteAccount()}
                    disabled={isSubmitting}
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700 disabled:opacity-60"
                >
                    <Trash2 className="h-4 w-4"/>
                    Supprimer mon compte
                </button>
            </div>
        </section>
    );
}