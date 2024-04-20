import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';

describe('App e2e', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
        app = moduleRef.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
            }),
        );

        await app.init();
        await app.listen(3334);
        prisma = app.get(PrismaService);

        await prisma.cleanDb();

        pactum.request.setBaseUrl('http://localhost:3334');
    });

    afterAll(() => {
        app.close();
    });

    describe('Auth', () => {
        describe('Signup', () => {
            const dto: AuthDto = {
                email: 'adas@text.pl',
                password: 'chmura224',
            };
            it('should throw if email is empty', () => {
                return pactum
                    .spec()
                    .post('/auth/signup')
                    .withBody({
                        password: '123',
                    })
                    .expectStatus(400);
            });
            it('should throw if password is empty', () => {
                return pactum
                    .spec()
                    .post('/auth/signup')
                    .withBody({
                        email: '123@asd.ts',
                    })
                    .expectStatus(400);
            });
            it('should throw if email is not validate', () => {
                return pactum
                    .spec()
                    .post('/auth/signup')
                    .withBody({
                        email: '123asd.ts',
                        password: 'sdad',
                    })
                    .expectStatus(400);
            });
            it('should throw if no body ', () => {
                return pactum.spec().post('/auth/signup').expectStatus(400);
            });
            it('should signup', () => {
                return pactum
                    .spec()
                    .post('/auth/signup')
                    .withBody(dto)
                    .expectStatus(201);
            });
        });
        describe('Signin', () => {
            it('should throw if email is empty', () => {
                return pactum
                    .spec()
                    .post('/auth/signin')
                    .withBody({
                        password: '123',
                    })
                    .expectStatus(400);
            });
            it('should throw if password is empty', () => {
                return pactum
                    .spec()
                    .post('/auth/signin')
                    .withBody({
                        email: '123@asd.ts',
                    })
                    .expectStatus(400);
            });
            it('should throw if email is not validate', () => {
                return pactum
                    .spec()
                    .post('/auth/signin')
                    .withBody({
                        email: '123asd.ts',
                        password: 'sdad',
                    })
                    .expectStatus(400);
            });
            it('should throw if no body ', () => {
                return pactum.spec().post('/auth/signin').expectStatus(400);
            });
            it('should not sigin', () => {
                const dto: AuthDto = {
                    email: 'adas@text.pl',
                    password: '111',
                };
                return pactum
                    .spec()
                    .post('/auth/signin')
                    .withBody(dto)
                    .expectStatus(403);
            });
            it('should sigin', () => {
                const dto: AuthDto = {
                    email: 'adas@text.pl',
                    password: 'chmura224',
                };
                return pactum
                    .spec()
                    .post('/auth/signin')
                    .withBody(dto)
                    .expectStatus(200)
                    .stores('userAt', 'access_token');
            });
        });
    });
    describe('User', () => {
        describe('Get me', () => {
            it('should get correct user', () => {
                return pactum
                    .spec()
                    .get('/users/me')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })
                    .expectStatus(200);
            });
        });
        describe('Edit User', () => {
            const dto: EditUserDto = {
                firstName: 'ggg',
            };
            it('should update user', () => {
                return pactum
                    .spec()
                    .patch('/users')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })
                    .withBody(dto)
                    .expectStatus(200)
                    .expectBodyContains(dto.firstName);
            });
        });
    });
    describe('Bookmarks', () => {
        describe('Get empty bookmark', () => {
            it('should get empty', () => {
                return pactum
                    .spec()
                    .get('/bookmark/')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })
                    .expectStatus(200)
                    .expectBody([]);
            });
        });
        describe('Create bookmark', () => {
            const dto: CreateBookmarkDto = {
                title: 'First Bookmark',
                link: 'http://github/archibold',
            };
            it('should create bookmark', () => {
                return pactum
                    .spec()
                    .post('/bookmark/')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })
                    .withBody(dto)
                    .expectStatus(201)
                    .stores('bookmarkId', 'id');
            });
        });
        describe('Get bookmarks', () => {
            it('should get bookmarks', () => {
                return pactum
                    .spec()
                    .get('/bookmark/')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })
                    .expectStatus(200)
                    .expectJsonLength(1);
            });
        });

        describe('Get bookmarks by Id', () => {
            it('should get bookmark by id', () => {
                return pactum
                    .spec()
                    .get('/bookmark/{id}')
                    .withPathParams('id', '$S{bookmarkId}')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })
                    .expectStatus(200)
                    .expectBodyContains('$S{bookmarkId}');
            });
        });

        describe('Edit bookmark by id', () => {
            const dto: EditBookmarkDto = {
                title: 'edited Bookmark',
                description: 'added description',
            };
            it('should not edit bookmark', () => {
                return pactum
                    .spec()
                    .patch('/bookmark/{id}')
                    .withPathParams('id', 'aa$S{bookmarkId}')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })
                    .withBody(dto)
                    .expectStatus(400);
            });

            it('should edit bookmark', () => {
                return pactum
                    .spec()
                    .patch('/bookmark/{id}')
                    .withPathParams('id', '$S{bookmarkId}')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })
                    .withBody(dto)
                    .expectStatus(200)
                    .expectBodyContains(dto.title)
                    .expectBodyContains(dto.description);
            });
        });
        describe('Delete bookmark by id', () => {
            it('should delete bookmark', () => {
                return pactum
                    .spec()
                    .delete('/bookmark/{id}')
                    .withPathParams('id', '$S{bookmarkId}')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })
                    .expectStatus(204);
            });
            it('should get empty', () => {
                return pactum
                    .spec()
                    .get('/bookmark/')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })
                    .expectStatus(200)
                    .expectBody([]);
            });
        });
    });
});
