import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Resource } from '../models/Resource';
import { Bookmark } from '../models/Bookmark';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const serialize = (r: any, isBookmarked = false) => ({
  id: r._id,
  title: r.title,
  description: r.description,
  category: r.category,
  type: r.type,
  url: r.url,
  thumbnail: r.thumbnail,
  duration: r.duration,
  author: r.author,
  tags: r.tags,
  isBookmarked,
});

/**
 * GET /resources?category=&search=
 */
export const getAllResources = async (req: Request, res: Response) => {
  const { category, search } = req.query as { category?: string; search?: string };
  const filter: any = {};
  if (category) filter.category = category;
  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [
      { title: regex },
      { description: regex },
      { tags: regex },
    ];
  }
  const resources = await Resource.find(filter).lean();

  // If user is authenticated, mark which resources are bookmarked
  const userId = (req as AuthenticatedRequest).user?.id;
  let bookmarkedIds = new Set<string>();
  if (userId) {
    const bookmarks = await Bookmark.find({ user: userId }).select('resource').lean();
    bookmarkedIds = new Set(bookmarks.map((b) => String(b.resource)));
  }

  const data = resources.map((r) => serialize(r, bookmarkedIds.has(String(r._id))));
  res.status(StatusCodes.OK).json({ success: true, data });
};

/**
 * GET /resources/bookmarked
 */
export const getBookmarkedResources = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const bookmarks = await Bookmark.find({ user: req.user.id }).populate('resource').lean();
  const data = bookmarks
    .filter((b) => b.resource)
    .map((b) => serialize(b.resource as any, true));
  res.status(StatusCodes.OK).json({ success: true, data });
};

/**
 * POST /resources/:resourceId/bookmark
 */
export const bookmarkResource = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const resource = await Resource.findById(req.params.resourceId);
  if (!resource) throw ApiError.notFound('Resource not found');

  await Bookmark.updateOne(
    { user: req.user.id, resource: resource._id },
    { $setOnInsert: { user: req.user.id, resource: resource._id } },
    { upsert: true }
  );
  res.status(StatusCodes.OK).json({ success: true, message: 'Resource bookmarked' });
};

/**
 * DELETE /resources/:resourceId/bookmark
 */
export const removeBookmark = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await Bookmark.deleteOne({ user: req.user.id, resource: req.params.resourceId });
  res.status(StatusCodes.OK).json({ success: true, message: 'Bookmark removed' });
};
