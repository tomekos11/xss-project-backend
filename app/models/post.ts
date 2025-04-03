import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { BaseModel, column, belongsTo, beforeUpdate } from '@adonisjs/lucid/orm'
import User from './user.js'
import Topic from './topic.js'
import PostHistory from './post_history.js'
export default class Post extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number | null // Może być null, jeśli użytkownik zostanie usunięty

  @column()
  declare topicId: number

  @column()
  declare content: string

  @column()
  declare isDeleted: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Topic)
  declare topic: BelongsTo<typeof Topic>

  @beforeUpdate()
  public static async storeHistory(post: Post) {
    await PostHistory.create({
      postId: post.id,
      userId: post.userId,
      content: post.content,
    })
  }

  public async deleteWithHistory(deletedByUserId: number) {
    await PostHistory.create({
      postId: this.id,
      userId: this.userId,
      content: this.content,
      deletedBy: deletedByUserId,
    })

    this.content = '[Post został usunięty]'
    this.isDeleted = true
    await this.save()
  }
}
