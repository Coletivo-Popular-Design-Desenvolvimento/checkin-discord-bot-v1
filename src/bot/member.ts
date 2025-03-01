import { ClientEvents, Events } from "discord.js";

type GuildMemberUpdateListener = (...args: ClientEvents[typeof Events.GuildMemberUpdate]) => void;

export const checkForRoleUpdate: GuildMemberUpdateListener = (oldMember, newMember) => {
  const oldRoleIds = oldMember.roles.cache.map((role) => role.id);
  const newRoleIds = newMember.roles.cache.map((role) => role.id);

  const addedRoles = newRoleIds.filter((role) => !oldRoleIds.includes(role));
  const removedRoles = oldRoleIds.filter((role) => !newRoleIds.includes(role));

  const latestDisplayName = newMember.user.displayName;

  if (addedRoles.length > 0) {
    console.log(`Cargos adicionados (${latestDisplayName}):`);
    console.log(`>>> ${addedRoles}`);
  }

  if (removedRoles.length > 0) {
    console.log(`Cargos removidos (${latestDisplayName}):`);
    console.log(`>>> ${removedRoles}`);
  }
};
