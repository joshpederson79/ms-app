import Input from './Input.jsx';
import Select from './Select.jsx';
import Textarea from './Textarea.jsx';
import styles from './Fields.module.css';

const ACCEPTED_FILES = '.txt,.pro,.cho,.chordpro,text/plain';

// ChordPro text plus metadata. A file picker fills the textarea so the text stays editable before saving.
export default function TabFields({ register, watch, setValue, errors, chordproRequired = false }) {
  const sourceType = watch('source_type');

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (file) setValue('chordpro', await file.text(), { shouldValidate: true, shouldDirty: true });
  };

  return (
    <>
      <Select label="Tab source" {...register('source_type')}>
        <option value="original">Original (band-created)</option>
        <option value="cover">Cover</option>
        <option value="ug_link">Cover — Ultimate Guitar link</option>
        <option value="ug_file">Cover — downloaded Ultimate Guitar tab</option>
      </Select>

      {sourceType === 'ug_link' && (
        <Input
          label="Ultimate Guitar URL *"
          type="url"
          {...register('source_url', { required: 'Paste the Ultimate Guitar link' })}
          error={errors.source_url?.message}
        />
      )}

      <div className="grid">
        <Input label="Key" placeholder="E" {...register('key')} />
        <Input
          label="Tempo (BPM)"
          type="number"
          {...register('tempo', { min: { value: 20, message: '20–400' }, max: { value: 400, message: '20–400' } })}
          error={errors.tempo?.message}
        />
        <Input
          label="Capo"
          type="number"
          {...register('capo', { min: { value: 0, message: '0–12' }, max: { value: 12, message: '0–12' } })}
          error={errors.capo?.message}
        />
        <Input label="Tuning" placeholder="Standard" {...register('tuning')} />
      </div>

      <label className={styles.file}>
        Load a ChordPro file: <input type="file" accept={ACCEPTED_FILES} onChange={onFile} />
      </label>

      <Textarea
        label={chordproRequired ? 'Tab (ChordPro) *' : 'Tab (ChordPro)'}
        mono
        rows={14}
        placeholder={'[Verse 1]\n[E]Well I\'ve been drinking whiskey [B7]all night long'}
        hint="Chords go in [brackets] right before the syllable. Section headers like [Verse 1] or [Chorus] go on their own line."
        {...register('chordpro', chordproRequired ? { required: 'Tab is required' } : {})}
        error={errors.chordpro?.message}
      />
    </>
  );
}
