const date = new Date();


const formatData =
	(input) => {
		if (input > 9) {
			return input;
		} else return `0${input}`;
	};



const formatHour =
	(input) => {
		if (input > 12) {
			return input - 12;
		}
		return input;
	};

export const format = {
	dd: formatData(date.getDate()),
	mm: formatData(date.getMonth() + 1),
	yyyy: date.getFullYear(),
	HH: formatData(date.getHours()),
	hh: formatData(formatHour(date.getHours())),
	MM: formatData(date.getMinutes()),
	SS: formatData(date.getSeconds()),
};

export const format24Hour = (
	{
		dd, mm, yyyy,
		HH, MM, SS
	}) => {
};
