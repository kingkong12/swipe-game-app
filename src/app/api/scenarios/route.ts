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
        quality: body.category || null,
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

    let useD1 = false;
    try {
      const { getDb, updateScenario } = await import('@/lib/db');
      const db = getDb();
      useD1 = true;
      await updateScenario(db, body.id, body);
      return jsonResponse({ success: true });
    } catch (d1Error) {
      if (useD1) {
        console.error('D1 update failed:', d1Error);
        return jsonResponse({ success: false, error: 'Failed to update scenario in database' }, 500);
      }
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
    let deleted = false;
    let useD1 = false;

    try {
      const { getDb, deleteScenario } = await import('@/lib/db');
      const db = getDb();
      useD1 = true;
      await deleteScenario(db, id);
      deleted = true;
    } catch (d1Error) {
      if (useD1) {
        // D1 was available but delete failed (e.g., foreign key constraint)
        console.error('D1 delete failed:', d1Error);
        return jsonResponse({ success: false, error: 'Failed to delete scenario from database' }, 500);
      }
      // D1 not available — fall back to mock data (local dev)
      const { deleteScenario } = await import('@/lib/mock-data');
      deleted = deleteScenario(id);
    }

    return jsonResponse({ success: deleted, error: deleted ? undefined : 'Scenario not found' }, deleted ? 200 : 404);
  } catch (error) {
    console.error('Error deleting scenario:', error);
    return jsonResponse({ success: false, error: 'Failed to delete scenario' }, 500);
  }
}
