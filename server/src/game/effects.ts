import { SkillDef, SkillCastEvent, SkillEffectEvent, EffectEntity, Position, EntityId } from './types';

export class EffectManager {
  private activeEffects: Map<EntityId, EffectEntity> = new Map();
  private effectIdCounter = 1;

  // 创建技能施放事件
  createSkillCastEvent(casterId: string, skillId: string, targetId?: string, targetX?: number, targetY?: number): SkillCastEvent {
    return {
      casterId,
      skillId,
      targetId,
      targetX,
      targetY,
      timestamp: Date.now()
    };
  }

  // 创建技能特效事件
  createSkillEffectEvent(
    type: "cast" | "hit" | "area" | "projectile",
    skillId: string,
    casterId: string,
    x?: number,
    y?: number,
    targetId?: string,
    data?: any
  ): SkillEffectEvent {
    return {
      type,
      skillId,
      casterId,
      targetId,
      x,
      y,
      timestamp: Date.now(),
      data
    };
  }

  // 添加持续特效实体
  addPersistentEffect(
    effectType: string,
    position: Position,
    duration: number,
    ownerId?: string,
    data?: any
  ): EffectEntity {
    const id = `effect_${this.effectIdCounter++}`;
    const effect: EffectEntity = {
      id,
      type: "effect",
      effectType,
      x: position.x,
      y: position.y,
      ownerId,
      startTime: Date.now(),
      duration,
      data
    };
    
    this.activeEffects.set(id, effect);
    
    // 设置自动清理
    setTimeout(() => {
      this.removeEffect(id);
    }, duration);
    
    return effect;
  }

  // 移除特效
  removeEffect(effectId: EntityId): boolean {
    return this.activeEffects.delete(effectId);
  }

  // 获取所有活跃特效
  getActiveEffects(): EffectEntity[] {
    return Array.from(this.activeEffects.values());
  }

  // 清理过期特效
  cleanupExpiredEffects(): void {
    const now = Date.now();
    for (const [id, effect] of this.activeEffects.entries()) {
      if (now - effect.startTime >= effect.duration) {
        this.activeEffects.delete(id);
      }
    }
  }
}

// 全局特效管理器实例
export const effectManager = new EffectManager();