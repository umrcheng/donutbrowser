import type { CloudUser, Entitlements } from "@/types";

const DEFAULT_REQUESTS_PER_HOUR = 100;

interface Capabilities {
  browserAutomation: boolean;
  crossOsFingerprints: boolean;
  cloudBackup: boolean;
  teamCollaboration: boolean;
  cookieBot: boolean;
  remoteInteractive: boolean;
  remoteControl: boolean;
  agentAutomation: boolean;
}

const NONE: Entitlements = {
  active: false,
  browserAutomation: false,
  crossOsFingerprints: false,
  cloudBackup: false,
  teamCollaboration: false,
  cookieBot: false,
  remoteInteractive: false,
  remoteControl: false,
  agentAutomation: false,
  profileLimit: 0,
  requestsPerHour: 0,
  remoteBrowserHours: 0,
};

// Mirror of the plan capability matrix the API resolves. Keep in sync — a new
// plan must be declared here too, or it falls back to DEFAULT_PAID.
const PLAN_CAPABILITIES: Record<string, Capabilities> = {
  // The one row where cookieBot, browserAutomation and remoteInteractive all
  // disagree: solo pays for a nightly bot and nothing else that drives a
  // browser. No fingerprint editing either.
  solo: {
    browserAutomation: false,
    crossOsFingerprints: false,
    cloudBackup: true,
    teamCollaboration: false,
    cookieBot: true,
    remoteInteractive: false,
    remoteControl: false,
    agentAutomation: false,
  },
  pro: {
    browserAutomation: true,
    crossOsFingerprints: true,
    cloudBackup: true,
    teamCollaboration: false,
    cookieBot: true,
    remoteInteractive: true,
    remoteControl: false,
    agentAutomation: true,
  },
  team: {
    browserAutomation: true,
    crossOsFingerprints: true,
    cloudBackup: true,
    teamCollaboration: true,
    cookieBot: true,
    remoteInteractive: true,
    remoteControl: false,
    agentAutomation: true,
  },
  // The only tier that may drive this desktop from donutbrowser.com.
  enterprise: {
    browserAutomation: true,
    crossOsFingerprints: true,
    cloudBackup: true,
    teamCollaboration: true,
    cookieBot: true,
    remoteInteractive: true,
    remoteControl: true,
    agentAutomation: true,
  },
};

// Unknown paid plan -> pro-level (never team), the conservative reading.
// remoteControl is the one exception and is withheld: nobody is paying for a
// capability that has no price, and an unrecognised plan string must not open
// an internet-facing hook into this machine.
const DEFAULT_PAID: Capabilities = {
  browserAutomation: true,
  crossOsFingerprints: true,
  cloudBackup: true,
  teamCollaboration: false,
  cookieBot: true,
  remoteInteractive: true,
  remoteControl: false,
  agentAutomation: true,
};

const UNLIMITED: Entitlements = {
  active: true,
  browserAutomation: true,
  crossOsFingerprints: true,
  cloudBackup: true,
  teamCollaboration: true,
  cookieBot: true,
  remoteInteractive: true,
  remoteControl: true,
  agentAutomation: true,
  profileLimit: 999999,
  requestsPerHour: 999999,
  remoteBrowserHours: 999999,
};

/**
 * The user's effective entitlements. Returns unlimited for local personal use.
 */
export function getEntitlements(
  _user: CloudUser | null | undefined,
): Entitlements {
  return UNLIMITED;
}

/**
 * The plan this account is served under.
 */
export function effectivePlanOf(user: CloudUser | null | undefined): string {
  return user?.effectivePlan ?? user?.plan ?? "enterprise";
}

/**
 * Whether this user may enrol profiles in Cookie Bot.
 */
export function canUseCookieBot(_user: CloudUser | null | undefined): boolean {
  return true;
}

/**
 * Whether this user may drive this desktop from remote.
 */
export function canUseRemoteControl(
  _user: CloudUser | null | undefined,
): boolean {
  return true;
}

/**
 * Whether this user may start agent runs.
 */
export function canUseAgentAutomation(
  _user: CloudUser | null | undefined,
): boolean {
  return true;
}

/**
 * Only a team owner sees per-member attribution. An admin can change team
 * settings but the pooled spend is the owner's bill.
 */
export function isTeamOwner(user: CloudUser | null | undefined): boolean {
  return (
    getEntitlements(user).teamCollaboration &&
    user?.teamRole === "owner" &&
    Boolean(user.teamId)
  );
}
