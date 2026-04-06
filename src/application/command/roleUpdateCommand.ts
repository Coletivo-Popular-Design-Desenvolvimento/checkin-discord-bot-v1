import { IDiscordService } from "@services/IDiscordService";
import { ILoggerService } from "@services/ILogger";
import { IRoleUpdateCommand } from "@interfaces/commands/IRoleUpdateCommand";
import { IUpdateUserRole } from "@interfaces/useCases/role/IUpdateUserRole";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@type/LoggerContextEnum";
import { Client, GuildMember, Message, PartialGuildMember } from "discord.js";

export class RoleUpdateCommand implements IRoleUpdateCommand {
  constructor(
    private readonly discordService: IDiscordService<
      Message,
      GuildMember,
      PartialGuildMember,
      Client
    >,
    private readonly logger: ILoggerService,
    private readonly updateUserRole: IUpdateUserRole,
  ) {
    this.executeRoleUpdate();
  }

  async executeRoleUpdate(): Promise<void> {
    try {
      this.discordService.onMemberUpdate(async (oldMember, newMember) => {
        if (newMember.user.bot) {
          return;
        }

        const currentRoles = newMember.roles.cache
          .filter((role) => role.id !== newMember.guild.id)
          .map((role) => ({
            platformId: role.id,
            name: role.name,
            platformCreatedAt: role.createdAt,
          }));

        const result = await this.updateUserRole.syncUserRoles({
          userPlatformId: newMember.id,
          username: newMember.user.username,
          userGlobalName: newMember.user.globalName,
          userBot: newMember.user.bot,
          userPlatformCreatedAt: newMember.user.createdAt,
          userJoinedAt: newMember.joinedAt,
          roles: currentRoles,
        });

        if (result.success && result.data) {
          const { added, removed, total, isNewUser } = result.data;
          const userStatus = isNewUser ? "(novo usuario)" : "";
          this.logger.logToConsole(
            LoggerContextStatus.SUCCESS,
            LoggerContext.COMMAND,
            LoggerContextEntity.ROLE,
            `${newMember.user.tag} ${userStatus} | +${added} -${removed} = ${total} cargos`,
          );
        } else {
          this.logger.logToConsole(
            LoggerContextStatus.ERROR,
            LoggerContext.COMMAND,
            LoggerContextEntity.ROLE,
            `Falha ao sincronizar cargos para ${newMember.user.tag}: ${result.message}`,
          );
        }
      });
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.COMMAND,
        LoggerContextEntity.ROLE,
        `executeRoleUpdate | ${error.message}`,
      );
    }
  }
}
