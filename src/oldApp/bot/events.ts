import { GuildScheduledEvent, GuildScheduledEventCreateOptions, GuildScheduledEventStatus, User } from "discord.js";
import client from "./bot";
const { GUILD_ID } = process.env;

export const monitorEvents = (events: GuildScheduledEvent) => {
    console.log(
        `Eventos de ${events.id}`
    );

    console.log("events", events)
};

export const monitorCreateEvents = (event: GuildScheduledEventCreateOptions) => {
    console.log('event', event)
    console.log('Novo evento criado:');
    console.log(`Título: ${event.name}`);
    console.log(`Início: ${event.scheduledStartTime}`);
    console.log(`Fim: ${event.scheduledEndTime}`);
}

export const monitorEventUserAdd = (events: GuildScheduledEvent, user: User) => {
    console.log(
        `${user.tag} demonstrou interesse no evento ${events.name}`
    );
};

export const monitorEventUserRemove = (events: GuildScheduledEvent, user: User) => {
    console.log(
        `${user.tag} não está mais interessado no evento ${events.name}`
    );
};

// validação pegar o inicio do evento
export const monitorStatusEvent = (oldEvent: GuildScheduledEvent, newEvent: GuildScheduledEvent) => {
    if (oldEvent.status !== newEvent.status) {
        if (newEvent.status === GuildScheduledEventStatus.Scheduled ) {
          console.log(`O evento ${newEvent.name} começou!`);
        } else if (newEvent.status === GuildScheduledEventStatus.Completed) {
          console.log(`O evento ${newEvent.name} foi finalizado!`);
        } else if (newEvent.status === GuildScheduledEventStatus.Canceled) {
          console.log(`O evento ${newEvent.name} foi cancelado!`);
        }
    }
};


export const monitorStatusUpdateEvent = (oldEvent: GuildScheduledEvent, newEvent: GuildScheduledEvent) => {
    if (oldEvent.name !== newEvent.name) {
        console.log(`O evento mudou de nome name: ${oldEvent.name} -> ${newEvent.name}`);
    }

    if (oldEvent.description !== newEvent.description) {
        console.log(`O evento mudou de nome description: ${oldEvent.description} -> ${newEvent.description}`);
    }

    if (oldEvent.scheduledStartAt !== newEvent.scheduledStartAt) {
        console.log(`O evento mudou de nome scheduledStartAt: ${oldEvent.scheduledStartAt } -> ${newEvent.scheduledStartAt}`);
    }

    if (oldEvent.scheduledEndAt !== newEvent.scheduledEndAt) {
        console.log(`O evento mudou de nome scheduledEndAt: ${oldEvent.scheduledEndAt} -> ${newEvent.scheduledEndAt}`);
    }

    if (oldEvent.status !== newEvent.status) {
        console.log(`O evento mudou de nome status: ${oldEvent.status} -> ${newEvent.status}`);
        
    }

    console.log(oldEvent)
}



export const scheduledEventsFetch = async () => {
    const guild = await client.guilds.fetch(GUILD_ID);
    const events = await guild.scheduledEvents.fetch();
  
    if (events.size === 0) {
      console.log('Não há eventos agendados neste servidor.');
      return;
    }
  
    for (const [id, event] of events) {
      console.log(`ID: ${id} | Nome: ${event.name} | Início: ${event.scheduledStartAt} | Término: ${event.scheduledEndAt}`);
    }
}