export class PhonemeCreateDto {
	name: string;

	poster: string;

	constructor(name: string, path: string) {
		this.name = name;
		this.poster = `${path}/affiche${name}.pdf`;
	}
}
