const { GUILD_ID } = process.env;

export const monitorEvents = (events) => {
    console.log(
        `Eventos de${events.name}: ${events.scheduledStartAt}`
    );

};

export const monitorCreateEvents = (event) => {
    console.log('event', event)
    console.log('Novo evento criado:');
    console.log(`Título: ${event.name}`);
    console.log(`Início: ${event.scheduledStartTime}`);
    console.log(`Fim: ${event.scheduledEndTime}`);
}

export const monitorEventUserAdd = (events, user) => {
    console.log(
        `${user.tag} demonstrou interesse no evento ${events.name}`
    );
};

export const monitorEventUserRemove = (events, user) => {
    console.log(
        `${user.tag} não está mais interessado no evento ${events.name}`
    );
};

// validação pegar o inicio do evento
export const monitorStatusEvent = (oldEvent, newEvent) => {
    if (oldEvent.status !== newEvent.status) {
        if (newEvent.status === 'ACTIVE') {
          console.log(`O evento ${newEvent.name} começou!`);
        } else if (newEvent.status === 'COMPLETED') {
          console.log(`O evento ${newEvent.name} foi finalizado!`);
        } else if (newEvent.status === 'CANCELED') {
          console.log(`O evento ${newEvent.name} foi cancelado!`);
        }
    }
};

export const monitorStatusUpdateEvent = (oldEvent, newEvent) => {
    if (oldEvent.name !== newEvent.name) {
        console.log(`O evento mudou de nome: ${oldEvent.name} -> ${newEvent.name}`);
    }

    if (oldEvent.scheduledStartTime.getTime() !== newEvent.scheduledStartTime.getTime()) {
        console.log(`O horário de início do evento foi alterado.`);
    }
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