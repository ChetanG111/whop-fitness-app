import { Button } from "@whop/react/components";
import { headers } from "next/headers";
import Link from "next/link";
import { whopsdk } from "@/lib/whop-sdk";
import styles from "./page.module.css";

export default async function Page({ params }: { params: { experienceId: string } }) {
    let userId = "unknown";
    let accessLevel = "unknown";
    let accessRaw: any = null;

    try {
    const headersObj = await headers();
        // Try common header names for the Whop user token. Some environments put the token
        // in `x-whop-user-token`, others may use the Authorization header.
        const rawToken =
            headersObj.get("x-whop-user-token") ||
            headersObj.get("authorization") ||
            headersObj.get("Authorization") ||
            null;

        const token = rawToken && rawToken.startsWith("Bearer ") ? rawToken.slice(7) : rawToken;

        // Prefer passing the token string when available; otherwise pass the headers object.
        const { userId: verifiedUserId } = await whopsdk.verifyUserToken(token ?? (headersObj as any));
        userId = verifiedUserId;

        // `params` can be an object or a Promise depending on Next.js internals.
        // Resolve it safely so we always have an `experienceId` string.
        const resolvedParams: any =
            params && typeof (params as any).then === "function" ? await (params as any) : params;
        const experienceId = resolvedParams?.experienceId;

        if (!experienceId) {
            throw new Error("Missing experienceId in route params");
        }

        // Fetch experience, user, and access directly from the SDK like the original example
        const [experience, userData, accessData] = await Promise.all([
            whopsdk.experiences.retrieve(experienceId),
            whopsdk.users.retrieve(userId),
            whopsdk.users.checkAccess(experienceId, { id: userId }),
        ]);

        accessRaw = accessData;

        // Debug logs to help diagnose missing access level in server logs
        console.debug("whop: token (raw):", rawToken);
        console.debug("whop: token (stripped):", token);
        console.debug("whop: verifiedUserId:", verifiedUserId);
        console.debug("whop: experience:", experience);
        console.debug("whop: userData:", userData);
        console.debug("whop: accessData:", accessData);

        // Tolerant resolution of access level from the access response
        const resolveAccess = (a: any) => {
            if (!a) return null;
            if (typeof a === "string" && a) return a;
            if (typeof a === "object") {
                return (
                    a.access_level ||
                    a.accessLevel ||
                    a.level ||
                    a.access ||
                    a.permission ||
                    a.role ||
                    (a.data && (a.data.access_level || a.data.level)) ||
                    (a.attributes && a.attributes.access_level) ||
                    null
                );
            }
            return null;
        };

        accessLevel = resolveAccess(accessData) || "unknown";
    } catch (error) {
        console.error("Error getting user data:", error);
        // Gracefully handle errors, e.g. user not found or invalid token
        // The UI will show "unknown" for userId and accessLevel
    }


    return (
        <main className={styles.main}>
            <div aria-live="polite" className={styles.card}>
                <h2 className={styles.title}>Your Session</h2>
                <p className={styles.subtitle}>
                    Visible to you only
                </p>

                <div className={styles.grid}>
                    <div>
                        <div className={styles.label}>User ID</div>
                        <div className={styles.input}>
                            {userId}
                        </div>
                    </div>

                    <div>
                        <div className={styles.label}>Access level</div>
                        <div className={styles.input}>
                            {accessLevel}
                        </div>
                    </div>
                </div>

                <div className={styles.buttonContainer}>
                    <Link href={`/dashboard`} passHref>
                        <Button 
                            size="4" 
                            className={styles.button}
                        >
                            Continue to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
    );
}