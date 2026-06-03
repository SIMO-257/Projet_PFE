I need you to verify that my database schema (.sql file) has ALL the columns that my Laravel backend expects. I manually edited the schema and want to ensure I didn't remove any columns that are actually used in my models or controllers.

## Context:
- I have a Laravel backend with Eloquent models and controllers
- I created/edited a .sql schema file for Docker
- I need to check for columns that are REFERENCED in code but MISSING from my .sql file

## Validation Approach:

### Phase 1: Model Property Scan
Search my entire backend codebase for:
1. **`$fillable` arrays** - these are columns that can be mass-assigned
2. **`$casts` arrays** - these columns have type conversions
3. **`$hidden` / `$appends`** - special model properties
4. **`protected $table`** - custom table names
5. **Relationship methods** (`belongsTo`, `hasMany`, `hasOne`, `belongsToMany`) - these imply foreign key columns exist

### Phase 2: Controller & Logic Scan
Search for:
1. **`Model::create([...])`** - all array keys inside are column names
2. **`Model::update([...])`** - all array keys inside are column names
3. **`->where('column_name', ...)`** - columns used in queries
4. **`->orderBy('column_name')`** - columns used for sorting
5. **`->select('col1', 'col2')`** - explicitly selected columns
6. **`$model->column_name`** (anywhere after model fetch) - direct property access

### Phase 3: Foreign Key & Join Checks
Search for:
1. **`->join(..., 'table.foreign_id', '=', 'other.id')`** - join columns
2. **`->with('relation')`** - needs foreign key on correct table
3. **`DB::raw('...')`** containing column references

## Prioritize These "Critical" Columns (often used but easy to miss):

| Pattern | What it implies |
|---------|-----------------|
| `Auth::user()->id` | `id` column exists |
| `$user->email` or `$user->password` | login columns |
| `created_at` / `updated_at` | timestamps (often assumed) |
| `foreignId('user_id')` | the `user_id` column |
| `$table->timestamps()` | both created_at AND updated_at |
| `remember_token` | Laravel auth feature |
| Soft deletes (`SoftDeletes` trait) | `deleted_at` column |

## Output Format:

For each missing column, report:
- **File**: path/to/controller/Model.php
- **Line**: ~123
- **Missing column**: `column_name`
- **Table**: `table_name`
- **Why needed**: (e.g., "used in where clause", "in fillable array")

Final verdict:
- ✅ **SAFE** - No missing columns found
- ⚠️ **WARNING** - Found X missing columns that the backend expects
- ❌ **CRITICAL** - Missing columns that would break authentication/core features

