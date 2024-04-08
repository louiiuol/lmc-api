import {ApiProperty} from '@nestjs/swagger';

export class TokenJWT {
	@ApiProperty({
		description:
			"Token d'identification. Permet d'effectuer des requêtes dont l'accès est restreint par le role de l'utilisateur associé. (valable 1 jour)",
		example:
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImxvdWlzLmdvZGxld3NraUBnbWFpbC5jb20iLCJpYXQiOjE3MTIxNDQxNDEsImV4cCI6MTcxMjIzMDU0MX0.2-VnrlBW8SN--iVbn6MCWjLpL5ba5AzLZYv3tMwyU_s',
	})
	accessToken: string;

	@ApiProperty({
		description:
			"Token de rafraîchissement. Permet de renouveler les tokens en appelant la route '/api/auth/refresh'. (valable 15 jours)",
		example:
			'eyJhbGcreiJIUzI1NiIsInR5cCIgrkpXVCJ9.eyJ1c2VybmFtZSI6ImxvdWreredvZGxld3NraUBnbWFpbC5jb20iLCJpYXQiOjE3MTIxNDQxNDEsImV4cCI6MTcxMjIzMDU0MX0.2-VnrlBW8SN--iVbn6MCWjLpL5ba5AzLZYuiou787HJKyh',
	})
	refreshToken: string;
}
