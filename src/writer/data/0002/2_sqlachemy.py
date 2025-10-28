# __init__.py
# Copyright (C) 2005-2025 the SQLAlchemy authors and contributors
# <see AUTHORS file>
#
# This module is part of SQLAlchemy and is released under
# the MIT License: https://www.opensource.org/licenses/mit-license.php

from __future__ import annotations

from typing import Any

from . import util as _util
from .engine import AdaptedConnection as AdaptedConnection
from .engine import BaseRow as BaseRow
from .engine import BindTyping as BindTyping
from .engine import ChunkedIteratorResult as ChunkedIteratorResult
from .engine import Compiled as Compiled
from .engine import Connection as Connection
from .engine import create_engine as create_engine
from .engine import create_mock_engine as create_mock_engine
from .engine import create_pool_from_url as create_pool_from_url
from .engine import CreateEnginePlugin as CreateEnginePlugin
from .engine import CursorResult as CursorResult
from .engine import Dialect as Dialect
from .engine import Engine as Engine
from .engine import engine_from_config as engine_from_config
from .engine import ExceptionContext as ExceptionContext
from .engine import ExecutionContext as ExecutionContext
from .engine import FrozenResult as FrozenResult
from .engine import Inspector as Inspector
from .engine import IteratorResult as IteratorResult
from .engine import make_url as make_url
from .engine import MappingResult as MappingResult
from .engine import MergedResult as MergedResult
from .engine import NestedTransaction as NestedTransaction
from .engine import Result as Result
from .engine import result_tuple as result_tuple
from .engine import ResultProxy as ResultProxy
from .engine import RootTransaction as RootTransaction
from .engine import Row as Row
from .engine import RowMapping as RowMapping
from .engine import ScalarResult as ScalarResult
from .engine import Transaction as Transaction
from .engine import TwoPhaseTransaction as TwoPhaseTransaction
from .engine import TypeCompiler as TypeCompiler
from .engine import URL as URL
from .inspection import inspect as inspect
from .pool import AssertionPool as AssertionPool
from .pool import AsyncAdaptedQueuePool as AsyncAdaptedQueuePool
from .pool import (
    FallbackAsyncAdaptedQueuePool as FallbackAsyncAdaptedQueuePool,
)
from .pool import NullPool as NullPool
from .pool import Pool as Pool
from .pool import PoolProxiedConnection as PoolProxiedConnection
from .pool import PoolResetState as PoolResetState
from .pool import QueuePool as QueuePool
from .pool import SingletonThreadPool as SingletonThreadPool
from .pool import StaticPool as StaticPool
from .schema import BaseDDLElement as BaseDDLElement
from .schema import BLANK_SCHEMA as BLANK_SCHEMA
from .schema import CheckConstraint as CheckConstraint
from .schema import Column as Column
from .schema import ColumnDefault as ColumnDefault
from .schema import Computed as Computed
from .schema import Constraint as Constraint
from .schema import DDL as DDL
from .schema import DDLElement as DDLElement
from .schema import DefaultClause as DefaultClause
from .schema import ExecutableDDLElement as ExecutableDDLElement
from .schema import FetchedValue as FetchedValue
from .schema import ForeignKey as ForeignKey
from .schema import ForeignKeyConstraint as ForeignKeyConstraint
from .schema import Identity as Identity
from .schema import Index as Index
from .schema import insert_sentinel as insert_sentinel
from .schema import MetaData as MetaData
from .schema import PrimaryKeyConstraint as PrimaryKeyConstraint
from .schema import Sequence as Sequence
from .schema import Table as Table
from .schema import UniqueConstraint as UniqueConstraint
from .sql import ColumnExpressionArgument as ColumnExpressionArgument
from .sql import NotNullable as NotNullable
from .sql import Nullable as Nullable
from .sql import SelectLabelStyle as SelectLabelStyle
from .sql.expression import Alias as Alias
from .sql.expression import alias as alias
from .sql.expression import AliasedReturnsRows as AliasedReturnsRows
from .sql.expression import all_ as all_
from .sql.expression import and_ as and_
from .sql.expression import any_ as any_
from .sql.