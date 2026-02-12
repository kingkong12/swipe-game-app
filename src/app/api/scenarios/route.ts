import { NextRequest } from 'next/server';
import { jsonResponse } from '@/lib/api-helpers';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { getDb, listScenarios } = await import('@/lib/db');
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const setId = searchParams.get('setId') || undefined;
    const scenarios = await listScenarios(db, setId);
    return jsonResponse({ success: true, scenarios });
  } catch {
    const { getActiveScenarios } = await import('@/lib/mock-data');
    const scenarios = getActiveScenarios();
    return jsonResponse({ success: true, scenarios });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      text?: string;
      shortLabel?: string;
      category?: string;
      setId?: string;
    };

    if (!body.text) {
      return jsonResponse({ success: false, error: 'Text is required' }, 400);
    }

    try {
      const { getDb, createScenario } = await import('@/lib/db');
      const db = getDb();
      const scenario = await createScenario(db, { text: body.text, shortLabel: body.shortLabel, category: body.category, setId: body.setId });
      return jsonResponse({ success: true, scenario });
    } catch {
      const { addScenario } = await import('@/lib/mock-data');
      const scenario = addScenario({
        text: body.text,
        shortLabel: body.shortLabel || null,
        category: body.category || null,
        isActive: true,
      });
      return jsonResponse({ success: true, scenario });
    }
  } catch (error) {
    console.error('Error creating scenario:', error);
    return jsonResponse({ success: false, error: 'Failed to create scenario' }, 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as {
      id?: string;
      text?: string;
      shortLabel?: string;
      category?: string;
      isActive?: boolean;
    };

    if (!body.id) {
      return jsonResponse({ success: false, error: 'ID is required' }, 400);
    }

    try {
      const { getDb, updateScenario } = await import('@/lib/db');
      const db = getDb();
      await updateScenario(db, body.id, body);
      return jsonResponse({ success: true });
    } catch {
      const { updateScenario } = await import('@/lib/mock-data');
      updateScenario(body.id, body);
      return jsonResponse({ success: true });
    }
  } catch (error) {
    console.error('Error updating scenario:', error);
    return jsonResponse({ success: false, error: 'Failed to update scenario' }, 500);
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return jsonResponse({ success: false, error: 'ID is required' }, 400);
  }

  try {
    try {
      const { getDb, deleteScenario } = await import('@/lib/db');
      const db = getDb();
      await deleteScenario(db, id);
    } catch {
      const { deleteScenario } = await import('@/lib/mock-data');
      deleteScenario(id);
    }
    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Error deleting scenario:', error);
    return jsonResponse({ success: false, error: 'Failed to delete scenario' }, 500);
  }
}
