# Expressions

> These pages are under construction, if needed, please refer to the previous [README](readme_previous.md)

An Expression is a string containing functions and pseudo code

There are two flavors of Expressions

- Common Expressions
- [Roll Expressions](roll_expressions.md)

An Expression can be a static string like `This is a static string` or a function like `@{NUM_STRENGTH}`

## Functions

### ceil()

##### Syntax

```
ceil(number)
```

A classic, rounds to the highest number. Example: `ceil(2.5)` => will return 3 in the roll on chat

### floor()

##### Syntax

```
floor(number)
```

It rounds to the lowest number. Example: `ceil(2.5)` => will return 2 in the roll on chat

### maxdie()

##### Syntax

```
maxdie(expression;total)
```

Returns the maximum roll result of a simple dice roll XdY. So `maxdie(2d6;false)` returns 6. If you want to return the highest possible result for the whole roll then the "total" argument needs to be true. In this last case, `maxdie(2d6;true)` will return 12

### @{}

##### Syntax

```
@{character_property_key}
```

Returns the value of a actor property

So, imagine that the Key of the Level Property is "lvl". You can reference it on the roll with `@{lvl}`. So if you need to roll 1d6 + level to the chat you just use: `1d6+@{lvl}`

### #{}

##### Syntax

```
#{citem_property_key}
```

Returns the value of a cItem property in an actor

If you are using a roll expression from a cItem you can reference one or more of its attributes with this. As an example, imagine a cItem has a "damage" property, and you want a roll expression to roll 1d6 + this attribute. So the roll expression would be `1d6+#{damage}`. Remember `@{}` is for Actor attributes, `#{}` is for cItem attributes.

![](./resources/citem_sword_example.png)

### d{}

##### Syntax

```
#{dialog_property_key}
```

Returns the value of a dialog property, see 

### %[]

##### Syntax

```
%[expression,0:min return,value1:return_for_value1,valueN:return_for_valueN]
```

You know that in many TTRPGs you have a value and a modifier related to it. And most of the times the calculation of the modifier is not a simple arithmetic calculation, is more of a table search. For example, you could have a system that requires you to roll 1d20 for a number of traits, and from 1 to 10 the trait modifier would be +0, 11 to 12 would be +1, 13 to 16 would be +2, and 17+ would be +3. This expression deals with that, simply by using 
`%[1d20,0:0,11:1,13:2,17:3]`. Easy, and very useful.

An other option to do this would be with a [Lookup](lookups.md)

### Lookup functions

See [Lookup](lookups.md)

### if[]

##### Syntax

```
if[expression:compared_value,return_if_true,return_if_false]
```

Very useful expression especially for text attributes. Let's say you have a system in which you want to check if the attribute called "ismagical" of a specific cItem is true, and in case it is you want to return 2 to the roll chat. So the expression you need is `if[#{ismagical}:true,2,0]`
If can accept nested expressions, a maximum of 8. Below are the expressions:

+ Single IF with no ANDs no ORs --> `if[Field:condition,true_value, false_value]`

+ Single IF with ORs only --> `if[FIELD1:COND1 OR FIELD2:COND2 OR....FIELDn:CONDn,true_value, false_value]` 

+ Single IF with ANDs only --> `if[FIELD1:COND1 AND FIELD2:COND2 AND....FIELDn:CONDn,true_value, false_value]`

+ Single IF with ANDs and ORs (it always execute first ANDs) --> `if[FIELD1:COND1 AND FIELD2:COND2 OR....FIELDn:CONDn,true_value, false_value]` 

+ Nested IFs with or without ANDs and ORs (it works with the same logic as before)
  Example without ANDs and ORs `if[F:C,true_value,ELSE if[F:C, true_value, ELSE if[F:C,true_value,false_Value]]]`.....
  Example with ANDs and ORs 

  ```
  if[F1:C1 OR F2:C2 AND F3:C3,true_value,ELSE if[F:C, true_value,ELSE if[F:C AND F4:C4,true_value,false_Value]]]
  ```

  IMPORTANT: IF can only accept 8 ELSE expressions!

#### `----`

##### Syntax

```
--cItem_attribute_name--
```

This function returns the value of a cItem attribute if you pass the attribute's Key to it. Lets imagine we set Torch (the cItem created earlier as an example) as a CONSUMABLE MOD and fill the Roll Options fields. If we set its roll expression as `1d6 + --weight--` it will roll to chat 1d6 plus the value of its Weight attribute (remember we defined it as part of the Group object).

#### `____`

##### Syntax

```
__Actor_attribute_name__
```

This function with double underscore(`__`) returns the value of an Actor attribute if you pass the attribute's Key to it. Imagine you have a list type Property of Key "selectedskill" on your character sheet, and this list has as options all the available skills in the system (i.e: climb, deception, swim, etc). You want to make this property rollable, and when clicked you want the sheet to roll 1d6+the value of the selected skill. You need then to reference the skills (which are attributes), so you can do this with `1d6 + __@{selectedskill}__` . How does this work? When you select, let's say the "climb" option, this function will return `__climb__`, that is equivalent to `@{climb}`. 

#### |

##### Syntax

```
|Expression
```

This functions prevent Sandbox from parsing roll expressions, returning them as text. For example, lets say you just want to return to the chat "1d6", without rolling the 1d6, you just want a text saying "1d6". You then have to use `|1d6` in your roll expressions.

### max()

##### Syntax

```
max(expr1,expr2,expr3)
```

Returns the maximum value within a series of expressions. For example `max(2,3,4,@{value})` will return the maximum value of that list. You can combine with roll registrations (see below) like `max(?[Name])`, that will return the max die of all dice from a registered roll called Name.  

### min()

##### Syntax

```
min(expr1,expr2,expr3)
```

Return the minimum value of the list. You can also use a registered roll here!

### count()

Syntax

```
countE(expr1,expr2,expr3;value)
```

Returns the counts the number of expression results that are equal to the value. For example, using our previous example  `countE(?[Test];3)` will return  how many dice are equal to 3 (from the 3d6 rolled in the example).

### countH()

##### Syntax

```
countH(expr1,expr2,expr3;value)
```

Returns number of elements in the list with a value higher than 3. Can also be used with registered rolls like `countH(?[Name];3)`.

### countL()

##### Syntax

```
countL(expr1,expr2,expr3;value)
```

Returns number of elements in the list with a value lower than 3.  Can also be used with registered rolls like `countL(?[Name];3)` 

### sum()

##### Syntax

```
sum(expr1,expr2,expr3)
```

Returns the sum of all elements in the list.  Can also be used with registered rolls like `sum(?[Name])` 

### maxdie()

##### Syntax

```
maxdie(XdY)
```

Returns the max result in a simple roll expression, For example, `maxdie(1d6)` returns 6.