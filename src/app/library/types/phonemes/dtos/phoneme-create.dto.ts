export class PhonemeCreateDto {
	name: string;
	poster?: boolean;

	constructor(phoneme: {name: string; poster?: boolean}) {
		this.name = phoneme.name;
		this.poster = phoneme.poster;
	}
}
