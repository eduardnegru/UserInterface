class SocketSingleton
{
	constructor()
	{
		this.socket = null;
	}

	get()
	{
		if(this.socket === null)
		{
			this.socket = new WebSocket('ws://localhost:8888')
			return this.socket;
		}
		else
		{
			return this.socket
		}
	}
}

export default new SocketSingleton();