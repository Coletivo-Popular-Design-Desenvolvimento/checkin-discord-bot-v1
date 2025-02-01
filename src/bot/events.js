import client from "./bot";
const { GUILD_ID } = process.env;

const eventosAgendados = {};

export const monitorEvents = (events) => {
    console.log(
        `Eventos de${events.name}: ${events.scheduledStartAt}`
    );

    console.log("events", events)

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
        if (newEvent.status === 1) {
          console.log(`O evento ${newEvent.name} começou!`);
        } else if (newEvent.status === 'COMPLETED') {
          console.log(`O evento ${newEvent.name} foi finalizado!`);
        } else if (newEvent.status === 'CANCELED') {
          console.log(`O evento ${newEvent.name} foi cancelado!`);
        }
    }
};

export const updateStatusEvent = (oldEvent, newEvent) => {
    const teste = typeof oldEvent;
    console.log("status typeof", teste)
    if(oldEvent.name === "Testando name event") {
        if (oldEvent.status === 1) {
            newEvent.status.set(2)
            console.log(`O evento ${newEvent.name} começou!`);
        }
    }
};

export const monitorStatusUpdateEvent = (oldEvent, newEvent) => {
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