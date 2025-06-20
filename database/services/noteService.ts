import { database } from "../sqlite/database"
import type { LocalNote } from "../models/types"

export class NoteService {
  private static instance: NoteService

  private constructor() {}

  public static getInstance(): NoteService {
    if (!NoteService.instance) {
      NoteService.instance = new NoteService()
    }
    return NoteService.instance
  }

  public async getAllNotes(): Promise<LocalNote[]> {
    const notes = await database.selectQuery("SELECT * FROM local_notes ORDER BY updated_at DESC")
    return this.parseNotes(notes)
  }

  public async getNoteById(id: number): Promise<LocalNote | null> {
    const note = await database.selectFirstQuery("SELECT * FROM local_notes WHERE id = ?", [id])
    return note ? this.parseNote(note) : null
  }

  public async getNotesByClass(classId: string): Promise<LocalNote[]> {
    const notes = await database.selectQuery("SELECT * FROM local_notes WHERE class_id = ? ORDER BY updated_at DESC", [
      classId,
    ])
    return this.parseNotes(notes)
  }

  public async getFavoriteNotes(): Promise<LocalNote[]> {
    const notes = await database.selectQuery("SELECT * FROM local_notes WHERE is_favorite = 1 ORDER BY updated_at DESC")
    return this.parseNotes(notes)
  }

  public async createNote(noteData: Omit<LocalNote, "id" | "created_at" | "updated_at">): Promise<LocalNote> {
    const now = new Date().toISOString()
    const wordCount = this.calculateWordCount(noteData.content || "")

    const result = await database.executeQuery(
      `INSERT INTO local_notes 
       (class_id, title, content, content_html, attachments_paths, 
        created_at, updated_at, is_favorite, word_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        noteData.class_id,
        noteData.title,
        noteData.content,
        noteData.content_html,
        JSON.stringify(noteData.attachments_paths),
        now,
        now,
        noteData.is_favorite ? 1 : 0,
        wordCount,
      ],
    )

    const newNote: LocalNote = {
      id: result.lastInsertRowId as number,
      ...noteData,
      created_at: now,
      updated_at: now,
      word_count: wordCount,
    }

    return newNote
  }

  public async updateNote(id: number, updates: Partial<LocalNote>): Promise<LocalNote | null> {
    const existingNote = await this.getNoteById(id)
    if (!existingNote) return null

    const updatedNote = {
      ...existingNote,
      ...updates,
      updated_at: new Date().toISOString(),
    }

    // Recalculate word count if content changed
    if (updates.content !== undefined) {
      updatedNote.word_count = this.calculateWordCount(updates.content || "")
    }

    await database.executeQuery(
      `UPDATE local_notes SET 
       class_id = ?, title = ?, content = ?, content_html = ?, 
       attachments_paths = ?, updated_at = ?, is_favorite = ?, word_count = ?
       WHERE id = ?`,
      [
        updatedNote.class_id,
        updatedNote.title,
        updatedNote.content,
        updatedNote.content_html,
        JSON.stringify(updatedNote.attachments_paths),
        updatedNote.updated_at,
        updatedNote.is_favorite ? 1 : 0,
        updatedNote.word_count,
        id,
      ],
    )

    return updatedNote
  }

  public async deleteNote(id: number): Promise<boolean> {
    const result = await database.executeQuery("DELETE FROM local_notes WHERE id = ?", [id])

    return result.changes > 0
  }

  public async toggleFavorite(id: number): Promise<LocalNote | null> {
    const note = await this.getNoteById(id)
    if (!note) return null

    return this.updateNote(id, { is_favorite: !note.is_favorite })
  }

  public async searchNotes(query: string): Promise<LocalNote[]> {
    const notes = await database.selectQuery(
      `SELECT * FROM local_notes 
       WHERE title LIKE ? OR content LIKE ?
       ORDER BY updated_at DESC`,
      [`%${query}%`, `%${query}%`],
    )
    return this.parseNotes(notes)
  }

  public async getNotesWithAttachments(): Promise<LocalNote[]> {
    const notes = await database.selectQuery(
      `SELECT * FROM local_notes 
       WHERE attachments_paths != '[]' AND attachments_paths IS NOT NULL
       ORDER BY updated_at DESC`,
    )
    return this.parseNotes(notes)
  }

  public async getNoteStats(): Promise<{
    total: number
    favorites: number
    totalWords: number
    withAttachments: number
  }> {
    const [totalResult, favoritesResult, wordsResult, attachmentsResult] = await Promise.all([
      database.selectFirstQuery("SELECT COUNT(*) as count FROM local_notes"),
      database.selectFirstQuery("SELECT COUNT(*) as count FROM local_notes WHERE is_favorite = 1"),
      database.selectFirstQuery("SELECT SUM(word_count) as total FROM local_notes"),
      database.selectFirstQuery('SELECT COUNT(*) as count FROM local_notes WHERE attachments_paths != "[]"'),
    ])

    return {
      total: totalResult?.count || 0,
      favorites: favoritesResult?.count || 0,
      totalWords: wordsResult?.total || 0,
      withAttachments: attachmentsResult?.count || 0,
    }
  }

  private calculateWordCount(content: string): number {
    if (!content) return 0
    return content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
  }

  private parseNote(note: any): LocalNote {
    return {
      ...note,
      attachments_paths: note.attachments_paths ? JSON.parse(note.attachments_paths) : [],
      is_favorite: Boolean(note.is_favorite),
    }
  }

  private parseNotes(notes: any[]): LocalNote[] {
    return notes.map((note) => this.parseNote(note))
  }
}

// Export singleton instance
export const noteService = NoteService.getInstance()
