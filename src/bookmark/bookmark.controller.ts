import {
    Patch,
    Controller,
    Delete,
    Get,
    Post,
    UseGuards,
    Param,
    ParseIntPipe,
    Body,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { GetUser } from '../auth/decorator';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmark')
export class BookmarkController {
    constructor(private bookmarkService: BookmarkService) {}
    @Get()
    getBookmarks(@GetUser('id') userId: number) {
        return this.bookmarkService.getBookmarks(userId);
    }

    @Get(':id')
    getBookmarkById(
        @GetUser('id') userId: number,
        @Param('id', ParseIntPipe) bookmarkId: number,
    ) {
        return this.bookmarkService.getBookmarkById(userId, bookmarkId);
    }

    @Post()
    createBookmark(
        @GetUser('id') userId: number,
        @Body() dto: CreateBookmarkDto,
    ) {
        return this.bookmarkService.createBookmark(userId, dto);
    }

    @Patch(':id')
    editBookmarkByid(
        @GetUser('id') userId: number,
        @Param('id', ParseIntPipe) bookmarkId: number,
        @Body() dto: EditBookmarkDto,
    ) {
        return this.bookmarkService.editBookmarkByid(userId, bookmarkId, dto);
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    deleteBookmarkByid(
        @GetUser('id') userId: number,
        @Param('id', ParseIntPipe) bookmarkId: number,
    ) {
        return this.bookmarkService.deleteBookmarkByid(userId, bookmarkId);
    }
}
